
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { COLORS, MOCK_POSITIONS } from '../constants';

interface InterviewRoomProps {
  posId: string;
  onFinish: (history: any[]) => void;
}

// 辅助函数：Base64 编解码
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ posId, onFinish }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: '你好！我是湛江移动公司的 AI 面试官。感谢你应聘我们的岗位。在开始之前，你能简单介绍一下你自己吗？' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState(''); // 实时转录预览
  const [volume, setVolume] = useState(0); // 实时音量反馈 (0-1)
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const position = MOCK_POSITIONS.find(p => p.id === posId);
  const currentTranscriptionRef = useRef({ user: '', model: '' });

  useEffect(() => {
    // 预热输出音频上下文
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const cleanupAudio = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextInRef.current) {
      audioContextInRef.current.close();
      audioContextInRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
    setVolume(0);
  };

  const startListening = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextInRef.current = new AudioContext({ sampleRate: 16000 });
      // 重要：必须在用户交互后 resume 才能激活音频管道
      await audioContextInRef.current.resume();

      const source = audioContextInRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContextInRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `你是湛江移动公司的资深面试官。
          当前应聘岗位：${position?.title}。
          
          交互规则：
          1. 这是一个实时语音面试。
          2. 请保持耐心倾听。候选人可能在思考或停顿，不要中途打断。
          3. 只有当用户明确点击结束或停止音频输入后，你才进行完整的回应和追问。
          4. 你的回应要专业，结合中国移动的 5G/数字化转型背景。`
        },
        callbacks: {
          onopen: () => {
            setIsListening(true);
            source.connect(scriptProcessorRef.current!);
            scriptProcessorRef.current!.connect(audioContextInRef.current!.destination);
            console.log("Interview voice stream started");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentTranscriptionRef.current.user += text;
              setInterimText(currentTranscriptionRef.current.user);
            } else if (message.serverContent?.outputTranscription) {
              currentTranscriptionRef.current.model += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = currentTranscriptionRef.current.user.trim();
              const mText = currentTranscriptionRef.current.model.trim();
              
              if (uText || mText) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (uText && prev[prev.length-1]?.text !== uText) {
                    newMsgs.push({ role: 'user', text: uText });
                  }
                  if (mText) {
                    newMsgs.push({ role: 'model', text: mText });
                  }
                  return newMsgs;
                });
                setInterimText('');
                currentTranscriptionRef.current = { user: '', model: '' };
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              if (ctx.state === 'suspended') await ctx.resume();
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(sourceNode);
              sourceNode.onended = () => activeSourcesRef.current.delete(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Mic Error:", e);
            cleanupAudio();
          },
          onclose: () => setIsListening(false)
        }
      });

      sessionRef.current = await sessionPromise;

      scriptProcessorRef.current!.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // 计算音量用于反馈
        let sum = 0;
        for(let i=0; i<inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setVolume(Math.sqrt(sum / inputData.length));

        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const pcmBase64 = encode(new Uint8Array(int16.buffer));
        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

    } catch (err) {
      console.error("Mic access failed:", err);
      alert("无法访问麦克风，请检查浏览器权限设置。");
    }
  };

  const handleStopListening = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    setVolume(0);
    // 延迟切换状态，等待最后的转录到达
    setTimeout(() => {
        setIsListening(false);
    }, 800);
  };

  const handleSendText = async () => {
    if (!input.trim() || isProcessing) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ role: m.role === 'model' ? 'model' : 'user' as any, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: { systemInstruction: `你是湛江移动公司的资深面试官。岗位：${position?.title}。` }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '...' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">{position?.title}</h2>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isListening ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
              <span className="text-[10px] text-gray-500">{isListening ? '正在收听，点击下方停止按钮以回复' : 'AI 面试官等待中'}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onFinish(messages)} className="text-xs font-bold px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all">结束面试</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black ${m.role === 'user' ? 'bg-[#0070c0] text-white shadow-md' : 'bg-white text-gray-400 border shadow-sm'}`}>
                {m.role === 'user' ? 'ME' : 'AI'}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#0070c0] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {interimText && (
          <div className="flex justify-end">
            <div className="max-w-[80%] p-4 rounded-2xl bg-blue-50 text-blue-700 text-sm italic border border-blue-100 animate-pulse rounded-br-none">
              {interimText}
              <span className="ml-1 inline-block w-1 h-4 bg-blue-400 animate-caret"></span>
            </div>
          </div>
        )}
        {isProcessing && <div className="ml-11 text-[10px] text-gray-400 animate-pulse">面试官正在思考...</div>}
      </div>

      {/* Control Panel */}
      <div className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-6 w-full">
            {/* Mic Button with Volume feedback */}
            <div className="relative group">
              <button 
                onClick={isListening ? handleStopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl z-20 relative ${isListening ? 'bg-red-500 text-white' : 'bg-[#0070c0] text-white hover:scale-105'}`}
              >
                {isListening ? (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" /></svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
              </button>
              {/* Volume Aura */}
              {isListening && (
                <div 
                  className="absolute inset-0 bg-red-400 rounded-full -z-10 transition-transform duration-75 opacity-30"
                  style={{ transform: `scale(${1 + volume * 1.5})` }}
                ></div>
              )}
            </div>

            {/* Input Box */}
            <div className={`flex-1 flex items-end bg-gray-50 border rounded-2xl p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all ${isListening ? 'opacity-40 pointer-events-none' : ''}`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                placeholder={isListening ? "请继续说话..." : "输入文字回答..."}
                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2 resize-none max-h-32"
                rows={1}
              />
              <button onClick={handleSendText} disabled={!input.trim()} className={`p-2 rounded-xl ${!input.trim() ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 font-medium">
            {isListening ? "提示：说完请点击红色按钮，AI 将根据完整内容回复" : "点击麦克风开始实时语音面试，或使用下方输入框"}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes caret { from, to { opacity: 0 } 50% { opacity: 1 } }
        .animate-caret { animation: caret 1s step-end infinite; }
      `}</style>
    </div>
  );
};

export default InterviewRoom;
