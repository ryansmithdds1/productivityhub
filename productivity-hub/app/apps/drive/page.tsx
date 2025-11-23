'use client';



export default function DrivePage() {
    return (
        <>
            <div className="h-[calc(100vh-2rem)] w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-800">
                <iframe
                    src="https://drive.google.com/embeddedfolderview?id=0AHTuMsMTppGtUk9PVA#list"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    title="Shared Google Drive"
                />
            </div>
        </>
    );
}
