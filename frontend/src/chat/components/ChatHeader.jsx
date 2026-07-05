import React from 'react';
import { ChevronLeft, Phone, Video, MoreVertical } from 'lucide-react';

const ChatHeader = ({ doctor, onBack, onVideoCall, onPhoneCall }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{doctor.avatar || '👨‍⚕️'}</span>
              <div>
                <h2 className="font-semibold text-lg">{doctor.name}</h2>
                <p className="text-emerald-100 text-sm">{doctor.speciality}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPhoneCall}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Start phone call"
          >
            <Phone size={20} />
          </button>
          <button
            onClick={onVideoCall}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Start video call"
          >
            <Video size={20} />
          </button>
          <button
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
