const Machinery = require('../models/Machinery');

exports.getMachinery = async (req, res) => {
    try {
        const machinery = await Machinery.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            results: machinery.length,
            data: machinery
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createMachinery = async (req, res) => {
    try {
        const { name, owner, pricePerDay, location, image } = req.body;
        const newMachinery = await Machinery.create({
            name,
            owner: owner || req.user.fullName,
            pricePerDay,
            location,
            image,
            createdBy: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: newMachinery
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.rentMachinery = async (req, res) => {
    try {
        const machinery = await Machinery.findById(req.params.id);
        if (!machinery) {
            return res.status(404).json({ status: 'fail', message: 'No machinery item found with that ID' });
        }

        if (!machinery.available) {
            return res.status(400).json({ status: 'fail', message: 'This machinery item is already rented' });
        }

        machinery.available = false;
        await machinery.save();

        res.status(200).json({
            status: 'success',
            data: machinery
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
