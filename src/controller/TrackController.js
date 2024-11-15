import TrackModel from '../model/track.model.js';


class TrackController {
    async getTrackById(req, res) {
        const id = req.params.id;
        TrackModel.getById(id, (error, result) => {
        if (error) {
            return res.status(404).json({ message: error });
        }
        return res.status(200).json(result);
        });
    }
    async getAllTracks(req, res) {
        TrackModel.getAllTracks((error, result) => {
        if (error) {
            return res.status(404).json({ message: error });
        }
        return res.status(200).json(result);
        });
    }
    async deleteTrackById(req, res) {
        const {id} = req.params;
        TrackModel.deleteTrackById(id, (error, result) => {
        if (error) {
            return res.status(404).json({ message: error });
        }
        res.status(200).send({success: true, message: 'Track deleted successfully', result: result});
        });
    }
}
export default new TrackController();
