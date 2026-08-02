import React, { useMemo, useState } from 'react';
import aghelifardAvatar from '../../assets/img/aghelifard.jpg';
import amirBagherpourAvatar from '../../assets/img/amir_bagherpour.jpg';
import gordaniAvatar from '../../assets/img/gordani.jpg';
import motaghianAvatar from '../../assets/img/motaghian.jpg';
import nematollahianAvatar from '../../assets/img/nematollahian.jpg';
import shahghasempourAvatar from '../../assets/img/shahghasempour.jpg';
import smhNajiAvatar from '../../assets/img/smh naji.jpg';

const LOCAL_AVATARS = [
    aghelifardAvatar,
    amirBagherpourAvatar,
    gordaniAvatar,
    motaghianAvatar,
    nematollahianAvatar,
    shahghasempourAvatar,
    smhNajiAvatar,
];

export default function WhatsAppClone() {
    // State for search query in sidebar
    const [searchQuery, setSearchQuery] = useState('');
    // State for typing input in active chat
    const [typedMessage, setTypedMessage] = useState('');
    const avatars = useMemo(() => {
        const shuffledAvatars = [...LOCAL_AVATARS];
        for (let currentIndex = shuffledAvatars.length - 1; currentIndex > 0; currentIndex -= 1) {
            const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
            [shuffledAvatars[currentIndex], shuffledAvatars[randomIndex]] = [
                shuffledAvatars[randomIndex],
                shuffledAvatars[currentIndex],
            ];
        }
        return shuffledAvatars;
    }, []);

    // Mock Active Chat Info
    const activeChat = {
        name: "John Doe",
        avatar: avatars[1],
        status: "online",
    };

    // Mock Messages Array (Sent vs Received)
    const [messages, setMessages] = useState([
        { id: 1, text: "Hey! Are we still on for the meeting today?", time: "10:15 AM", isSent: false },
        { id: 2, text: "Yes, absolutely! I will be ready in 15 minutes.", time: "10:16 AM", isSent: true },
        { id: 3, text: "Great, see you in the conference room.", time: "10:17 AM", isSent: false },
    ]);

    // Mock Sidebar Chats List
    const chatList = [
        { id: 1, name: "John Doe", avatar: avatars[1], lastMsg: "Great, see you in the...", time: "10:17 AM", unread: 0, active: true },
        { id: 2, name: "Jane Smith", avatar: avatars[2], lastMsg: "Can you send me the file?", time: "Yesterday", unread: 2, active: false },
        { id: 3, name: "Dev Team Group", avatar: avatars[3], lastMsg: "Alex: Bug fixed on production", time: "Friday", unread: 0, active: false },
    ];

    // Handle Send Message Action
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim()) return;

        const newMsg = {
            id: messages.length + 1,
            text: typedMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
        };

        setMessages([...messages, newMsg]);
        setTypedMessage('');
    };

    return (
        <div className="flex h-screen w-screen bg-[#eae6df] overflow-hidden font-sans antialiased text-[#111b21]">
            {/* LEFT SIDEBAR PANEL */}
            <aside className="flex flex-col w-[30%] min-w-[340px] max-w-[400px] border-r border-[#d1d7db] bg-white">
                {/* Sidebar Header */}
                <header className="flex items-center justify-between h-[60px] bg-[#f0f2f5] px-4 py-2">
                    <img
                        src={avatars[0]}
                        alt="My Profile"
                        className="w-10 h-10 rounded-full cursor-pointer hover:opacity-90"
                    />
                    <div className="flex items-center space-x-6 text-[#54656f]">
                        <button className="hover:text-[#111b21] transition-colors">
                            {/* Communities Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.6 14c-.2-.1-.5-.2-.7-.3-.2-.1-.5-.1-.7-.2-.2 0-.5-.1-.7-.1h-.1c-.4 0-.8.1-1.1.2-.3.1-.6.3-.8.6-.2.2-.4.5-.5.8-.1.3-.1.7-.1 1 0 .2.1.4.1.6h-4c0-.2.1-.4.1-.6 0-.4-.1-.7-.2-1-.1-.3-.3-.6-.5-.8-.2-.3-.5-.4-.8-.6-.3-.1-.7-.2-1.1-.2h-.1c-.2 0-.5 0-.7.1-.2.1-.5.1-.7.2-.2.1-.4.2-.6.3-.7.4-1.2 1-1.5 1.7C2.1 16.1 2 16.5 2 17v1h13v-1c0-.5-.1-.9-.3-1.3-.2-.7-.7-1.3-1.4-1.7zm-4.1-6.5c0-.4-.1-.8-.3-1.1-.2-.3-.5-.6-.8-.8-.3-.2-.7-.3-1.1-.3s-.8.1-1.1.3c-.3.2-.6.5-.8.8-.2.3-.3.7-.3 1.1s.1.8.3 1.1c.2.3.5.6.8.8.3.2.7.3 1.1.3s.8-.1 1.1-.3c.3-.2.6-.5.8-.8.2-.3.3-.7.3-1.1zM22 17v1h-5v-1c0-.4-.1-.7-.2-1-.1-.3-.2-.6-.5-.8-.1-.1-.3-.2-.5-.3v-1.4c.5.2.9.5 1.2.9.4.5.6 1.1.6 1.7v.9h4zm-3-9.5c0-.4-.1-.7-.2-1-.1-.3-.3-.5-.5-.7-.2-.2-.5-.3-.9-.3s-.7.1-.9.3c-.2.2-.4.4-.5.7-.1.3-.2.6-.2 1s.1.7.2 1c.1.3.3.5.5.7.2.2.5.3.9.3s.7-.1.9-.3c.2-.2.4-.4.5-.7.1-.3.2-.6.2-1z"></path></svg>
                        </button>
                        <button className="hover:text-[#111b21] transition-colors">
                            {/* Status Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 20.25c4.549 0 8.25-3.701 8.25-8.25S16.549 3.75 12 3.75 3.75 7.451 3.75 12s3.701 8.25 8.25 8.25zm0 1.5c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"></path></svg>
                        </button>
                        <button className="hover:text-[#111b21] transition-colors">
                            {/* New Chat Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.005 3.175H4.995c-1.1 0-1.99.89-1.99 1.99v13.72c0 1.1.89 1.99 1.99 1.99h14.01c1.1 0 1.99-.89 1.99-1.99V5.165c0-1.1-.89-1.99-1.99-1.99zm-2.01 11h-3.01v3.01h-2v-3.01H8.975v-2h3.01V9.165h2v3.01h3.01v2z"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Sidebar Search Bar */}
                <div className="p-2 bg-white border-b border-[#f0f2f5]">
                    <div className="flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
                        <svg viewBox="0 0 24 24" width="20" height="20" className="text-[#667781] mr-3" fill="currentColor"><path d="M15.009 13.805h-.636l-.227-.217c.793-.924 1.27-2.124 1.27-3.428C15.416 7.152 12.836 4.57 9.708 4.57 6.58 4.57 4 7.152 4 10.16s2.58 5.59 5.708 5.59c1.301 0 2.498-.479 3.421-1.27l.217.228v.636l4.01 4.001 1.196-1.197-4.012-4.004zm-5.301 0c-2.012 0-3.64-1.631-3.64-3.645 0-2.014 1.628-3.645 3.64-3.645 2.013 0 3.64 1.631 3.64 3.645 0 2.014-1.628 3.645-3.64 3.645z"></path></svg>
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm text-[#3b4a54] outline-none placeholder-[#667781]"
                        />
                    </div>
                </div>

                {/* Sidebar Chat List Feed */}
                <div className="flex-1 overflow-y-auto bg-white divide-y divide-[#f0f2f5]">
                    {chatList.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex items-center justify-between px-3 py-3 cursor-pointer transition-colors ${chat.active ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                        >
                            <div className="flex items-center space-x-3 truncate">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover"/>
                                </div>
                                <div className="truncate">
                                    <h3 className="text-[16px] font-normal text-[#111b21]">{chat.name}</h3>
                                    <p className="text-sm text-[#667781] truncate">{chat.lastMsg}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 text-xs">
                                <span className={`mb-1 ${chat.unread > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781]'}`}>{chat.time}</span>
                                {chat.unread > 0 && (
                                    <span className="flex items-center justify-center bg-[#00a884] text-white font-semibold rounded-full min-w-[20px] h-5 px-1">
                    {chat.unread}
                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* RIGHT MAIN CHAT WINDOW */}
            <main className="flex flex-col flex-1 bg-[#efeae2] relative">
                {/* Decorative WhatsApp Style Background Pattern Mask */}
                <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: `url('https://githubusercontent.com')` }}
                />

                {/* Chat Header Header Banner */}
                <header className="flex items-center justify-between h-[60px] bg-[#f0f2f5] px-4 py-2 border-b border-[#d1d7db] z-10">
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover"/>
                        <div>
                            <h2 className="text-[16px] font-medium text-[#111b21] leading-tight">{activeChat.name}</h2>
                            <span className="text-xs text-[#667781] capitalize">{activeChat.status}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6 text-[#54656f]">
                        <button className="hover:text-[#111b21] transition-colors">
                            {/* Search in chat */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.009 13.805h-.636l-.227-.217c.793-.924 1.27-2.124 1.27-3.428C15.416 7.152 12.836 4.57 9.708 4.57 6.58 4.57 4 7.152 4 10.16s2.58 5.59 5.708 5.59c1.301 0 2.498-.479 3.421-1.27l.217.228v.636l4.01 4.001 1.196-1.197-4.012-4.004zm-5.301 0c-2.012 0-3.64-1.631-3.64-3.645 0-2.014 1.628-3.645 3.64-3.645 2.013 0 3.64 1.631 3.64 3.645 0 2.014-1.628 3.645-3.64 3.645z"></path></svg>
                        </button>
                        <button className="hover:text-[#111b21] transition-colors">
                            {/* Menu Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 12 9zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 12 15z"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Live Conversation Stream Box */}
                <section className="flex-1 overflow-y-auto px-8 py-4 space-y-2 z-10 flex flex-col">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex w-full ${msg.isSent ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm text-[14.2px] relative group ${
                                    msg.isSent ? 'bg-[#d9fdd3] text-[#111b21]' : 'bg-white text-[#111b21]'
                                }`}
                            >
                                {/* Message Body Content */}
                                <p className="pr-12 break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {/* Meta Details Layer (Timestamp + Checkmarks) */}
                                <div className="absolute bottom-1 right-2 flex items-center space-x-1 select-none text-[11px] text-[#667781]">
                                    <span>{msg.time}</span>
                                    {msg.isSent && (
                                        <svg viewBox="0 0 18 18" width="18" height="18" className="text-[#53bdeb]" fill="currentColor">
                                            <path d="M17.394 5.035l-1.531-1.532c-.209-.209-.552-.209-.761 0l-7.04 7.04-3.27-3.271c-.209-.209-.552-.209-.761 0l-1.531 1.532c-.209.209-.209.552 0 .761l4.032 4.033c.209.209.552.209.761 0l7.801-7.802c.208-.209.208-.552 0-.761zm-4.801 0l-1.531-1.532c-.209-.209-.552-.209-.761 0l-7.04 7.04-3.27-3.271c-.209-.209-.552-.209-.761 0l-1.531 1.532c-.209.209-.209.552 0 .761l4.032 4.033c.209.209.552.209.761 0l7.801-7.802c.208-.209.208-.552 0-.761z"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Chat Input Bottom Tool Tray */}
                <footer className="flex items-center h-[62px] bg-[#f0f2f5] px-4 py-2 z-10">
                    <button className="text-[#54656f] hover:text-[#111b21] transition-colors mr-2">
                        {/* Emoji Picker Button Icon */}
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9.153 11.603c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44-1.44.645-1.44 1.44.645 1.44 1.44 1.44zm4.366 0c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44-1.44.645-1.44 1.44.645 1.44 1.44 1.44zm-2.183 4.23c-.272 0-.543-.07-.795-.208a5.194 5.194 0 0 0-3.071-1.492c-.344-.047-.687-.07-.99-.07-.303 0-.606.023-.99.07a5.194 5.194 0 0 0-3.071 1.492c-.252.138-.523.208-.795.208-.65 0-1.177-.527-1.177-1.177 0-.285.106-.55.29-.753a6.602 6.602 0 0 1 3.25-1.996c.55-.075 1.1-.112 1.65-.112 0-.001.001-.001.001-.001.55 0 1.1.037 1.65.112a6.602 6.602 0 0 1 3.25 1.996c.184.203.29.468.29.753 0 .65-.527 1.177-1.177 1.177zm-2.183-14.23c-5.334 0-9.667 4.333-9.667 9.666 0 5.334 4.333 9.667 9.667 9.667 5.334 0 9.667-4.333 9.667-9.667 0-5.333-4.333-9.666-9.667-9.666zm0 17.333c-4.286 0-7.75-3.464-7.75-7.75 0-4.285 3.464-7.75 7.75-7.75 4.285 0 7.75 3.465 7.75 7.75 0 4.286-3.465 7.75-7.75 7.75z"></path></svg>
                    </button>
                    <button className="text-[#54656f] hover:text-[#111b21] transition-colors mr-2">
                        {/* Attachment Paperclip Button Icon */}
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M1.816 15.412c0-1.13.849-2.043 1.9-2.043h9.325c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5H3.716c-.276 0-.5.224-.5.5s.224.5.5.5h9.325c1.932 0 3.5-1.568 3.5-3.5s-1.568-3.5-3.5-3.5H3.716c-1.932 0-3.5 1.568-3.5 3.5 0 1.474.91 2.75 2.188 3.25-.02-.16-.03-.32-.03-.48zm18.27-7.425c0-1.13-.849-2.043-1.9-2.043H8.866c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5h9.325c.276 0 .5-.224.5-.5s-.224-.5-.5-.5H8.866c-1.932 0-3.5 1.568-3.5 3.5s1.568 3.5 3.5 3.5h9.325c1.932 0 3.5-1.568 3.5-3.5 0-1.474-.91-2.75-2.188-3.25.02.16.03.32.03.48z"></path></svg>
                    </button>

                    {/* Typing Form Field Wrapper */}
                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 mr-2">
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={typedMessage}
                            onChange={(e) => setTypedMessage(e.target.value)}
                            className="w-full bg-transparent text-[15px] text-[#111b21] outline-none placeholder-[#667781]"
                        />
                    </form>

                    {typedMessage.trim() ? (
                        <button type="submit" onClick={handleSendMessage} className="text-[#54656f] hover:text-[#111b21] transition-colors">
                            {/* Send Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                        </button>
                    ) : (
                        <button className="text-[#54656f] hover:text-[#111b21] transition-colors">
                            {/* Microphone Voice Icon */}
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.999 14.942c2.001 0 3.5-1.5 3.5-3.5V5.357c0-2.001-1.5-3.5-3.5-3.5s-3.5 1.5-3.5 3.5v6.085c0 2.001 1.5 3.5 3.5 3.5zm7.499-3.5c0 3.501-2.999 6-6 6s-6-2.499-6-6H4.499c0 4.001 3.199 7.357 7 7.942v3.5h3v-3.5c3.801-.585 7-3.941 7-7.942h-3z"></path></svg>
                        </button>
                    )}
                </footer>
            </main>
        </div>
    );
}
