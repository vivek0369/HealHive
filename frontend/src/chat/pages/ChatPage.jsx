import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import { dummyMessages } from '../data/dummyMessages';
import { io } from 'socket.io-client';

// Doctor data - can be extended with more doctors
const doctorData = {
  doc1: {
    id: 'doc1',
    name: 'Dr. Sarah Mitchell',
    speciality: 'Cardiologist',
    avatar: '👨‍⚕️',
  },
  doc2: {
    id: 'doc2',
    name: 'Dr. John Smith',
    speciality: 'General Practitioner',
    avatar: '👨‍⚕️',
  },
  doc3: {
    id: 'doc3',
    name: 'Dr. Emily Johnson',
    speciality: 'Dermatologist',
    avatar: '👩‍⚕️',
  },
};

const generateTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const generateDoctorResponse = (patientMessage) => {
  const responses = [
    'I understand. Can you tell me more about that?',
    'That\'s helpful information. How long have you been experiencing this?',
    'I see. Have you taken any medications for this?',
    'Thank you for sharing. Do you have any other symptoms?',
    'Let me know if the pain is constant or intermittent.',
    'That\'s important to know. We\'ll need to monitor this closely.',
    'I recommend keeping a symptom diary. How are you feeling now?',
    'This is valuable information. Let\'s discuss your treatment options.',
    'Have you experienced this before? When did it start?',
    'Good observation. Let\'s schedule some tests to get more clarity.',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const ChatPage = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'doctor' or 'patient'
  const [otherParty, setOtherParty] = useState({ name: 'User', avatar: '👤' });

  // Detect role and fetch consultation details
  useEffect(() => {
    const detectRole = async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        // Check if user is doctor
        const docRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (docRes.ok) {
          setUserRole('doctor');
          // Fetch patient details from consultation
          const statusRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/status/${consultationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (statusRes.ok) {
            const status = await statusRes.json();
            // For doctor, other party is patient - we'll get from socket messages or use placeholder
            setOtherParty({ name: 'Patient', avatar: '👤' });
          }
        } else {
          setUserRole('patient');
          // Fetch consultation status for doctor info
          const statusRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/status/${consultationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (statusRes.ok) {
            const status = await statusRes.json();
            if (status.doctor) {
              setOtherParty({
                name: status.doctor.name || 'Doctor',
                specialty: status.doctor.specialty,
                avatar: '👨‍⚕️',
              });
            }
          }
        }
      } catch (e) {
        console.warn('Role detection failed', e);
        setUserRole('patient'); // default
      }
    };
    detectRole();
  }, [user, consultationId]);

  useEffect(() => {
    if (!userRole) return;
    const s = io(import.meta.env.VITE_BACKEND_URL || '');
    setSocket(s);
    s.emit('joinRoom', consultationId);
    s.on('message', ({ from, message, senderName, senderRole: msgRole }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: msgRole || 'other',
          senderName: senderName || otherParty.name,
          senderRole: otherParty.specialty || '',
          avatar: otherParty.avatar,
          message,
          timestamp: generateTimestamp(),
          read: false,
        },
      ]);
    });
    return () => {
      s.disconnect();
    };
  }, [consultationId, userRole, otherParty]);

  const handleSendMessage = useCallback(
    (messageText) => {
      // Add own message
      const ownMessage = {
        id: messages.length + 1,
        sender: userRole === 'doctor' ? 'doctor' : 'patient',
        senderName: 'You',
        avatar: userRole === 'doctor' ? '👨‍⚕️' : '👤',
        message: messageText,
        timestamp: generateTimestamp(),
        read: true,
      };

      setMessages((prev) => [...prev, ownMessage]);
      setIsLoading(true);
      // Emit via socket with role identification
      if (socket) {
        socket.emit('message', {
          roomId: consultationId,
          message: messageText,
          senderName: user?.displayName || user?.email || 'User',
          senderRole: userRole,
        });
      }
      setTimeout(() => setIsLoading(false), 300);
    },
    [messages, socket, consultationId, userRole, user]
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleVideoCall = () => {
    navigate(`/call-room/${consultationId}`, {
      state: {
        doctor: { name: otherParty.name, specialty: otherParty.specialty },
        patientName: user?.displayName || 'Patient',
        paid: true // Assuming they are allowed to chat, they have paid
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <ChatHeader 
        doctor={otherParty} 
        onBack={handleBack} 
        onVideoCall={handleVideoCall} 
        onPhoneCall={handleVideoCall} 
      />

      {/* Messages */}
      <ChatMessages messages={messages} />

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatPage;
