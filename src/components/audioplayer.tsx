import {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
  } from 'react';
  export interface Track {
    title: string;
  }
  interface AudioPlayerContextType {
    currentTrack: Track;
    setCurrentTrack: Dispatch<SetStateAction<Track>>;
  }
  const AudioPlayerContext = createContext<
    AudioPlayerContextType | undefined
  >(undefined);
  export const AudioPlayerProvider = ({
    children,
  }: {
    children: ReactNode;
  }) =>{
    const [currentTrack,setCurrentTrack] = useState<Track>({title:"unspecified"});
    const contextValue= {
      currentTrack,
      setCurrentTrack,
    };
    return (
      <AudioPlayerContext.Provider value={contextValue}>
        {children}
      </AudioPlayerContext.Provider>
    );
  };
  export const useAudioPlayerContext = (): AudioPlayerContextType => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
      throw new Error(
        'useAudioPlayerContext must be used within an AudioPlayerProvider'
      );
    }
    return context;
  };