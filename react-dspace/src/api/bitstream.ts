
export const downloadPDF = async (uuid: string, name: string) => {
    try {
        const response = await fetch(`http://localhost:8080/server/api/core/bitstreams/${uuid}/content`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Failed to download PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
    }
};

export const getPDFUrl = (uuid: string): string => {
    return `http://localhost:8080/server/api/core/bitstreams/${uuid}/content`;
};


export const fetchPDFUrl = async (uuid: string): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8080/server/api/core/bitstreams/${uuid}/content`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch PDF.");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error fetching PDF:", error);
        throw error;
    }
};


