
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Smile, Search } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("recent");
  const pickerRef = useRef<HTMLDivElement>(null);

  const recentEmojis = ["😊", "😂", "👍", "😍", "🤩", "😎", "😄", "❤️"];
  
  const smileyEmojis = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
    "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "☺️", "🙂",
    "🤗", "🤩", "🤔", "🫡", "🤨", "😐", "😑", "😶", "🙄", "😏",
    "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌",
    "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🫠",
    "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭",
    "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶"
  ];

  const allEmojis = [...recentEmojis, ...smileyEmojis];

  const filteredEmojis = searchTerm 
    ? allEmojis.filter(emoji => emoji.includes(searchTerm))
    : activeTab === "recent" ? recentEmojis : smileyEmojis;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
    >
      {/* Header with Search */}
      <div className="p-3 border-b border-gray-600">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("recent")}
          className={`flex-1 rounded-none h-12 ${
            activeTab === "recent" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Clock size={16} className="mr-2" />
          Recently Used
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("smileys")}
          className={`flex-1 rounded-none h-12 ${
            activeTab === "smileys" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <Smile size={16} className="mr-2" />
          Smileys & People
        </Button>
      </div>

      {/* Emoji Grid */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => onEmojiSelect(emoji)}
              className="h-10 w-10 p-0 text-xl hover:bg-gray-700 rounded"
            >
              {emoji}
            </Button>
          ))}
        </div>
        {filteredEmojis.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
};
