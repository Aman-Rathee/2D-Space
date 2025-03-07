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
            <div className={cn("bg-red-600 h-[calc(100vh-49px)] w-72 fixed top-0 right-0", className)}>
                <div className="flex flex-col h-full bg-gray-100">
                    <div className="flex items-center justify-between bg-blue-500 fl text-white p-2">
                        <h1 className="text-xl font-bold">Chat Room</h1>
                        <X className="w-7 h-7 cursor-pointer" onClick={() => setIsChatOpen(false)} />
                    </div>

                    <div className="flex-1 p-1 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-2 ${message.user === "you" ? "text-right" : "text-left"}`}>
                                {message.user === 'you' ?
                                    <span className={"inline-block max-w-[90%] text-left break-words hyphens-auto px-2 py-1 rounded-md bg-blue-500 text-white"}>
                                        {message.text}
                                    </span> :
                                    <span className={"inline-block max-w-[90%] break-words hyphens-auto px-2 py-1 rounded-md bg-gray-300 text-gray-700"}>
                                        <div className="text-blue-500 text-sm font-semibold leading-3">{message.user}</div>
                                        <div className="leading-5">{message.text}</div>
                                    </span>}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-2 border-t">
                        <form className="flex" onSubmit={handleSubmit(onSubmit)}>
                            <input
                                {...register('message', { required: true })}
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 p-2 border rounded-l-lg focus:outline-none"
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                            <button type="submit" className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div >
        </>
    )
}
