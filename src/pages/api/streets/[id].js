import prisma from '../../../lib/prismaClient';

export default async function handler(req, res) {
    try {
        const { id } = req.query;
        const streetId = parseInt(id);

        if (isNaN(streetId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const callejero = await prisma.callejero.findUnique({
            where: { id: streetId }
        });

        if (!callejero) {
            return res.status(404).json({ error: 'Street not found' });
        }

        res.status(200).json(callejero);
    } catch (error) {
        console.error('❌ Error fetching street:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
