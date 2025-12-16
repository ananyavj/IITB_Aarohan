import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, GraduationCap } from 'lucide-react';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/select-role');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
            <div className="text-center">
                <div className="mb-8 flex justify-center">
                    <GraduationCap className="w-24 h-24 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-8">Educational PWA</h1>
                <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
            </div>
        </div>
    );
};

export default SplashScreen;
