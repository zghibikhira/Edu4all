import React, { useState, useEffect, useRef } from 'react';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaDesktop, 
  FaUsers, 
  FaComments, 
  FaCog, 
  FaPhoneSlash,
  FaPhone,
  FaShare,
  FaHandPaper,
  FaEllipsisH,
  FaUserPlus,
  FaUserMinus,
  FaLock,
  FaUnlock,
  FaRecordVinyl,
  FaStop,
  FaDownload,
  FaCamera,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaPlay,
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSave,
  FaPaperPlane
} from 'react-icons/fa';

const VideoSession = ({ sessionId, isTeacher = false, jitsiDomain = 'meet.jit.si' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [whiteboardMode, setWhiteboardMode] = useState('draw'); // draw, erase, text
  const [whiteboardColor, setWhiteboardColor] = useState('#000000');
  const [whiteboardSize, setWhiteboardSize] = useState(2);
  
  const whiteboardRef = useRef(null);

  useEffect(() => {
    initializeSession();
    loadMockData();
  }, []);

  const openJitsiInWindow = (roomName) => {
    const url = `https://${jitsiDomain}/${roomName}`;
    window.open(url, '_blank', 'noopener');
  };

  const initializeSession = () => {
    // Simuler l'initialisation de la session vidéo
    setTimeout(() => {
      setIsConnected(true);
    }, 2000);
  };

  const loadMockData = () => {
    // Mock participants
    setParticipants([
      {
        id: '1',
        name: 'Marie Dubois',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        isTeacher: true,
        isVideoOn: true,
        isAudioOn: true,
        isSpeaking: false,
        isHandRaised: false
      },
      {
        id: '2',
        name: 'Thomas Martin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        isTeacher: false,
        isVideoOn: true,
        isAudioOn: false,
        isSpeaking: true,
        isHandRaised: false
      },
      {
        id: '3',
        name: 'Emma Leroy',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        isTeacher: false,
        isVideoOn: false,
        isAudioOn: true,
        isSpeaking: false,
        isHandRaised: true
      }
    ]);

    // Mock chat messages
    setChatMessages([
      {
        id: '1',
        sender: 'Marie Dubois',
        message: 'Bonjour à tous ! Bienvenue dans cette session de mathématiques.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isTeacher: true
      },
      {
        id: '2',
        sender: 'Thomas Martin',
        message: 'Bonjour ! J\'ai une question sur l\'exercice 3.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isTeacher: false
      },
      {
        id: '3',
        sender: 'Emma Leroy',
        message: 'Moi aussi, je bloque sur cet exercice.',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        isTeacher: false
      }
    ]);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleWhiteboard = () => {
    setIsWhiteboardOpen(!isWhiteboardOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'Vous',
        message: newMessage,
        timestamp: new Date().toISOString(),
        isTeacher: isTeacher
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const raiseHand = () => {
    // Simuler lever la main
    alert('Main levée !');
  };

  const leaveSession = () => {
    if (window.confirm('Êtes-vous sûr de vouloir quitter la session ?')) {
      setIsConnected(false);
      // Rediriger vers la page précédente
    }
  };

  const muteParticipant = (participantId) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isAudioOn: !p.isAudioOn } : p
    ));
  };

  const removeParticipant = (participantId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce participant ?')) {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    }
  };

  const renderParticipant = (participant) => (
    <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        {participant.isVideoOn ? (
          <img 
            src={participant.avatar} 
            alt={participant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaVideoSlash className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-400 text-sm">{participant.name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {participant.isHandRaised && (
            <div className="bg-yellow-500 text-white p-1 rounded-full">
              <FaHandPaper className="w-3 h-3" />
            </div>
          )}
          {participant.isSpeaking && (
            <div className="bg-green-500 text-white p-1 rounded-full">
              <FaMicrophone className="w-3 h-3" />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-2 left-2">
          <p className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            {participant.name}
          </p>
        </div>
        
        {isTeacher && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={() => muteParticipant(participant.id)}
              className={`p-1 rounded ${participant.isAudioOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
            >
              {participant.isAudioOn ? <FaMicrophone className="w-3 h-3" /> : <FaMicrophoneSlash className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeParticipant(participant.id)}
              className="p-1 rounded bg-red-500 text-white"
            >
              <FaUserMinus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderWhiteboard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tableau blanc</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWhiteboardMode('draw')}
            className={`p-2 rounded ${whiteboardMode === 'draw' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <FaPencilAlt />
          </button>
          <button
            onClick={() => setWhiteboardMode('erase')}
            className={`p-2 rounded ${whiteboardMode === 'erase' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <FaEraser />
          </button>
          <input
            type="color"
            value={whiteboardColor}
            onChange={(e) => setWhiteboardColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300"
          />
          <input
            type="range"
            min="1"
            max="10"
            value={whiteboardSize}
            onChange={(e) => setWhiteboardSize(e.target.value)}
            className="w-20"
          />
          <button className="p-2 bg-gray-100 text-gray-600 rounded">
            <FaUndo />
          </button>
          <button className="p-2 bg-gray-100 text-gray-600 rounded">
            <FaRedo />
          </button>
          <button className="p-2 bg-gray-100 text-gray-600 rounded">
            <FaSave />
          </button>
        </div>
      </div>
      <div 
        ref={whiteboardRef}
        className="w-full h-96 bg-white border border-gray-300 rounded cursor-crosshair"
        style={{ cursor: whiteboardMode === 'draw' ? 'crosshair' : 'default' }}
      >
        <div className="flex items-center justify-center h-full text-gray-400">
          Cliquez et dessinez sur le tableau blanc
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat</h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {chatMessages.map((message) => (
          <div key={message.id} className="flex gap-2">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Tapez votre message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPaperPlane className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Participants ({participants.length})
      </h3>
      
      <div className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{participant.name}</p>
              <p className="text-sm text-gray-500">
                {participant.isTeacher ? 'Enseignant' : 'Étudiant'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {participant.isHandRaised && (
                <div className="bg-yellow-500 text-white p-1 rounded-full">
                  <FaHandPaper className="w-3 h-3" />
                </div>
              )}
              <div className={`p-1 rounded ${participant.isAudioOn ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {participant.isAudioOn ? <FaMicrophone className="w-3 h-3" /> : <FaMicrophoneSlash className="w-3 h-3" />}
              </div>
              <div className={`p-1 rounded ${participant.isVideoOn ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {participant.isVideoOn ? <FaVideo className="w-3 h-3" /> : <FaVideoSlash className="w-3 h-3" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Connexion à la session en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Main Video Area */}
      <div className="relative h-screen">
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full">
          {participants.map(renderParticipant)}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
            >
              {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
            >
              {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}
            >
              <FaDesktop />
            </button>

            <button
              type="button"
              onClick={() => {
                const room = sessionId || 'demo-room';
                openJitsiInWindow(room);
              }}
              className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <FaPlay />
            </button>
            
            <button
              onClick={raiseHand}
              className="p-3 rounded-full bg-gray-600 text-white hover:bg-yellow-500"
            >
              <FaHandPaper />
            </button>
            
            <button
              onClick={leaveSession}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <FaPhoneSlash />
            </button>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isTeacher && (
            <button
              onClick={toggleRecording}
              className={`p-2 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'}`}
            >
              {isRecording ? <FaStop /> : <FaRecordVinyl />}
            </button>
          )}
          
          <button
            onClick={toggleParticipants}
            className={`p-2 rounded ${isParticipantsOpen ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}
          >
            <FaUsers />
          </button>
          
          <button
            onClick={toggleChat}
            className={`p-2 rounded ${isChatOpen ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}
          >
            <FaComments />
          </button>
          
          <button
            onClick={toggleWhiteboard}
            className={`p-2 rounded ${isWhiteboardOpen ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}
          >
            <FaPencilAlt />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded bg-gray-600 text-white"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Sidebar Panels */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-40">
        {isParticipantsOpen && (
          <div className="h-full">
            {renderParticipants()}
          </div>
        )}
        
        {isChatOpen && (
          <div className="h-full">
            {renderChat()}
          </div>
        )}
        
        {isWhiteboardOpen && (
          <div className="h-full">
            {renderWhiteboard()}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSession;
