import { useState } from "react";
import { Bell, BellDot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import NotificationList from "./NotificationList";

const NotificationDropdown = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  console.log("unreadCount", unreadCount);

  const handleBellClick = () => {
    if (unreadCount > 0) setIsOpen(!isOpen);
    else navigate("/notifications");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={handleBellClick}>
          {unreadCount > 0 ? <BellDot className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="end">
        <NotificationList onClose={() => setIsOpen(false)} onViewAll={handleViewAll} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
