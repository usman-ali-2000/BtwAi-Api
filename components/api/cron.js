export default async function handler(req, res) {
    try {
        // Example PATCH request using Fetch without parameters
        const response = await fetch('https://btw-ai-api.vercel.app/add-coin', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Patch request successful:', data);
        res.status(200).json({ message: 'Patch request completed successfully' });

    } catch (error) {
        console.error('Error during patch request:', error.message);
        res.status(500).json({ message: 'Patch request failed' });
    }
}
