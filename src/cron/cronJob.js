// cronJob.js
import cron from 'node-cron';
import MusicModel from '../model/music.model.js'; // Adjust path as needed

cron.schedule('0 0 * * *', async () => {
    try {
        await MusicModel.updateTodayTopHitsPlaylist((error, result) => {
            if (error) {
                console.error('Error updating playlist:', error.message); // Log lỗi vào console
            } else {
                console.log('Playlist updated successfully:', result); // Log kết quả thành công
            }
        });
    } catch (error) {
        console.error('Test Error updating playlist:', error.message); // Log lỗi chung
    }
});


cron.schedule('0 0 * * *', async () => {
    try {
        // Gọi updateTodayTopHitsPlaylist và xử lý kết quả/error
        await MusicModel.updateMelodicTopTracksPlaylist((error, result) => {
            if (error) {
                console.error('Error updating playlist:', error.message); // Log lỗi vào console
            } else {
                console.log('Playlist updated successfully:', result); // Log kết quả thành công
            }
        });
    } catch (error) {
        console.error('Test Error updating playlist:', error.message); // Log lỗi chung
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        // Gọi  và xử lý kết quả/error
        await MusicModel.updateTodayTopFavPlaylist((error, result) => {
            if (error) {
                console.error('Error updating playlist:', error.message); // Log lỗi vào console
            } else {
                console.log('Playlist updated successfully:', result); // Log kết quả thành công
            }
        });
    } catch (error) {
        console.error('Test Error updating playlist:', error.message); // Log lỗi chung
    }
});

export default cron;