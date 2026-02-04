
import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export function WhatsAppButton() {
    const [location] = useLocation();

    // Determine message based on current page
    let message = "Hi, I need a book/stationery item.";
    if (location === "/bulk-orders") {
        message = "Hi, I need a quote for a BULK ORDER.";
    } else if (location.includes("shop")) {
        message = "Hi, I want to inquire about a product.";
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917754057200?text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group"
            aria-label="Chat on WhatsApp"
        >
            <span className="absolute flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 items-center justify-center transition-all shadow-lg shadow-green-500/30">
                    <MessageCircle className="h-7 w-7 text-white" fill="white" />
                </span>
            </span>

            {/* Tooltip */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-slate-800 text-sm font-bold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Chat with us
            </span>
        </a>
    );
}
