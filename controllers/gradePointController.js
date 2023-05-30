const GradePoint = require("../model/gradePoint");

exports.getGradePoint = async(req, res) => {
    try {
        const userId = req.user.id;

        const gradePoints = await GradePoint.find({user: userId});

        return res.json(gradePoints)
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

exports.postGradePoint = async (req, res) => {
    try {
        const {subject, creditUnit, calculatedGp} = req.body;
        const userId = req.user.id;

        const gradePoints = new GradePoint({
            subject,
            creditUnit,
            calculatedGp,
            user: userId
        });

        await gradePoints.save();

        // Add the grade points to the user's gradePoints array
        req.user.gradePoints.push(gradePoints);
        await req.user.save();

        res.status(201).json(gradePoints);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

exports.updateGradePoint = async (req, res) => {
    try {
        const gradePointId = req.params.gradeId;
        const {subject, creditUnit, calculatedGp} = req.body;
        const userId = req.user.id;

        //Find the grade point by Id and check if it belongs to the user
        const gradePoint = await GradePoint.findOne({gradeId: gradePointId, user: userId});

        if(!gradePoint) {
            return res.status(404).json({error: "Grade Point not found"});
        }

        //Update the grade point fields and save it
        gradePoint.subject = subject;
        gradePoint.creditUnit = creditUnit;
        gradePoint.calculatedGp = calculatedGp;

        await gradePoint.save();

        return res.json(gradePoint);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

exports.deleteGradePoint = async (req, res) => {
    try {
        const gradePointId = req.params.gradeId;
        const userId = req.user.id;

        //Find the grade point by Id and check if it belongs to the user
        const gradePoint = await GradePoint.findOne({gradeId: gradePointId, user: userId});

        if(!gradePoint) {
            return res.status(404).json({error: "Grade Point not found"});
        }

        //Retrieve the grade point from the user's grade points array and delete it
        const user = req.user;
        user.gradePoints.pull(gradePoint);

        await user.save();
        await gradePoint.deleteOne();

        res.json({message: "Grade point deleted successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}