import React from 'react';
import SplashScreen from './SplashScreen';

const Loader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => <SplashScreen onComplete={onComplete} />;

export default Loader;
