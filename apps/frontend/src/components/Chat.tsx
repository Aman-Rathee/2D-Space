import { X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "../utils/cnUtil";

export const Chat = ({ ws, className, setIsChatOpen }: { ws: WebSocket, className: string, setIsChatOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { register, handleSubmit, reset } = useForm();
    const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
            setMessages([...messages, { text: message.text, user: message.user }]);
        }
    };
    const onSubmit = (data: { [key: string]: string }) => {
        if (data.message.trim()) {
            setMessages([...messages, { text: data.message, user: "you" }]);
            ws.send(JSON.stringify({
                type: 'message',
                message: data.message
            }));
            reset()
        }
    };


    return (
        <>
            <div className={cn("h-[calc(100vh-49px)] w-72 fixed top-0 right-0", className)}>
                <div className="flex flex-col h-full border-l-2 bg-background-900">
                    <div className="flex items-center justify-between bg-background-700 p-2">
                        <h1 className="text-xl font-bold">Chat Room</h1>
                        <X strokeWidth={3} className="w-6 h-6 cursor-pointer text-foreground-100 hover:text-foreground-200 transition-colors" onClick={() => setIsChatOpen(false)} />
                    </div>

                    <div className="flex-1 p-1 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-2 ${message.user === "you" ? "text-right" : "text-left"}`}>
                                {message.user === 'you' ?
                                    <span className={"inline-block max-w-[90%] text-left break-words hyphens-auto px-2 py-1 leading-5 rounded-l-lg rounded-tr-lg bg-background-500"}>
                                        {message.text}
                                    </span> :
                                    <span className={"inline-block max-w-[90%] break-words hyphens-auto px-2 py-1 rounded-r-lg rounded-tl-lg bg-background-700"}>
                                        <div className="text-foreground-300 text-sm font-semibold leading-3">{message.user}</div>
                                        <div className="leading-5">{message.text}</div>
                                    </span>}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t">
                        <form autoComplete="off" className="flex" onSubmit={handleSubmit(onSubmit)}>
                            <input
                                {...register('message', { required: true })}
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 p-2 border rounded-l-lg focus:outline-hidden"
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                            <button type="submit" className="bg-background-400 px-4 rounded-r-lg cursor-pointer transition-colors hover:bg-background-500 outline-none">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div >
        </>
    )
}
