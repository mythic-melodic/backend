import AccountModel from '../model/account.model.js';
import useGoogleDriveUpload from '../hooks/upload.media.js';

class AccountController {
    async signup(req, res) {
        const user = req.body;
        try {
            AccountModel.signup(user, (error, result) => {
                if(error){
                    res.status(400).send(error);
                }
                res.status(200).send(result);
            });
        }
        catch (error) {
            res.status(500).send('Error: ' + error.message);
        }
    }
    async login(req, res) {
        const { username, password } = req.body;
        try {
            AccountModel.login(username, password, (error, result) => {
                if (error) {
                    return res.status(400).send(error); // Send error response and exit early
                }
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send('Error: ' + error.message);
        }
    }
    async logout(req, res) {
        res.status(200).send({ auth: false, token: null });
    }
    async getInfo(req, res) {
        const {id, username} = req.params;
        try{
            AccountModel.getUserByID(id, (error, result) => {
                if(error){
                    res.status(500).send('Error: ' + error.message);
                }
                res.status(200).send(result.rows);
            });
        }catch(error){
            res.status(500).send('Error: ' + error.message);
        }

    }
    
    async getAllUsers(req, res) {
        try{
            AccountModel.getAllUsers((error, result) => {
                if(error){
                    res.status(500).send('Error: ' + error.message);
                }
                res.status(200).send(result.rows);
            });
        }catch(error){
            res.status(500).send('Error: ' + error.message);
        }
    }
    async deleteUser(req, res) {
        const {username} = req.body;
        const {id} = req.params;
        try{
            AccountModel.deleteUserById(id, (error, result) => {
                if(error){
                    res.status(500).send('Error: ' + error.message);
                }
                res.status(200).send({success:true, message:"User deleted successfully", result});
            });
        }catch(error){
            res.status(500).send('Error: ' + error.message);
        }
    }
    async updateUser(req, res) {
        const { id } = req.params; // Lấy ID từ tham số
        const userData = req.body; // Lấy dữ liệu người dùng từ yêu cầu
    
        try {
            // Tải ảnh lên Google Drive (nếu có file)
            if(req.file){
            const avatar = await useGoogleDriveUpload(req, res);
    
            // Kiểm tra nếu có ảnh mới, cập nhật avatar trong userData
            if (req.file) {
                userData.avatar = avatar;
            }
        }
    
            // Gọi model để cập nhật người dùng
            const result = await AccountModel.updateUser(id, userData);
    
            res.status(200).send({
                success: true,
                message: "User updated successfully",
                result,
            });
        } catch (error) {
            // Xử lý lỗi từ model
            res.status(500).send({
                success: false,
                message: "Error updating user",
                error: error.message,
            });
        }
    }
    
    async changePassword(req, res) {
        const { id } = req.params; // Lấy ID từ params
        const { oldPassword, newPassword } = req.body; // Lấy oldPassword và newPassword từ body
    
        try {
            // Gọi model để thay đổi mật khẩu
            const result = await AccountModel.changePassword(id, oldPassword, newPassword);
            res.status(200).send(result); // Trả về phản hồi thành công
        } catch (error) {
            // Xử lý lỗi từ model
            res.status(200).send({
                success: false,
                message: "Error changing password",
                error: error.message,
            });
        }
    }    
    
}

export default new AccountController();
