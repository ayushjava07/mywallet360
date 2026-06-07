import { getWalletData } from "../services/etherscan.service.js";

export const getWalletProfile = async (req, res) => {
  try {
    const { address } = req.params;

    const walletData = await getWalletData(address);

    res.json(walletData);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success:false,
      message:"Something went wrong"
    });
  }
};
