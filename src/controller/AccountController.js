import AccountModel from "../model/account.model.js";

class AccountController {
  async signup(req, res) {
    const user = req.body;
    try {
      AccountModel.signup(user, (error, result) => {
        if (error) {
          res.status(400).send(error);
        }
        res.status(200).send(result);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
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
      res.status(500).send("Error: " + error.message);
    }
  }
  async logout(req, res) {
    res.status(200).send({ auth: false, token: null });
  }
  async getInfo(req, res) {
    const { id, username } = req.params;
    try {
      AccountModel.getUserByID(id, (error, result) => {
        if (error) {
          res.status(500).send("Error: " + error.message);
        }
        res.status(200).send(result.rows);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }

  async getAllUsers(req, res) {
    try {
      AccountModel.getAllUsers((error, result) => {
        if (error) {
          res.status(500).send("Error: " + error.message);
        }
        res.status(200).send(result.rows);
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
  async deleteUser(req, res) {
    const { username } = req.body;
    const { id } = req.params;
    try {
      AccountModel.deleteUserById(id, (error, result) => {
        if (error) {
          res.status(500).send("Error: " + error.message);
        }
        res.status(200).send({
          success: true,
          message: "User deleted successfully",
          result,
        });
      });
    } catch (error) {
      res.status(500).send("Error: " + error.message);
    }
  }
  async updateBalance(req, res) {
    try {
      const user_id = req.params.id;
      const { new_balance } = req.body;

      if (!user_id || new_balance == null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid input data. Please ensure all fields are filled out.",
        });
      }
      const result = await AccountModel.updateBalance(user_id, new_balance);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to update balance. User may not exist.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Balance updated successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Error updating balance:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update balance due to server error.",
        error: error.message,
      });
    }
  }
  async addToBalance(req, res) {
    try {
      const user_id = req.params.id;
      const { amount } = req.body;

      if (!user_id || amount == null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid input data. Please ensure all fields are filled out.",
        });
      }

      const result = await AccountModel.addToBalance(user_id, amount);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to add to balance. User may not exist.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Balance updated successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update balance due to server error.",
        error: error.message,
      });
    }
  }
}

export default new AccountController();
