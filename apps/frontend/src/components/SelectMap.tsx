import { useState } from "react";

interface Card {
    id: number;
    src: string;
    title: string;
}

export const SelectMap = ({ mapId, setMapId }: { mapId: number | null, setMapId: React.Dispatch<React.SetStateAction<number | null>> }) => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const cards: Card[] = [
        {
            id: 1,
            src: "/maps/map1/photo.png",
            title: "Map 1"
        }
    ];

    const handleCardClick = (cardId: number) => {
        setSelectedCard(selectedCard === cardId ? null : cardId);
        setMapId(mapId === cardId ? null : cardId)
    };

    return (
        <>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-lg font-bold">Select your Map.</h1>
                <div className="flex w-full p-5 gap-6 overflow-x-auto [scrollbar-width:none]">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`bg-white flex-none w-56 rounded-xl cursor-pointer transform transition-all duration-300 ${selectedCard === card.id ? 'ring-2 ring-gray-600 scale-105 hover:scale-105' : 'hover:scale-[102%] hover:shadow-lg'}`}
                        >
                            {selectedCard === card.id && (
                                <div className="absolute inset-0 bg-black opacity-50 rounded-xl"></div>
                            )}
                            <img
                                src={card.src}
                                alt={card.title}
                                className="h-36 w-full rounded-xl text-center object-cover overflow-hidden"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
