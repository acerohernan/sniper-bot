const Web3 =  require("web3");
const ethers = require("ethers");
const fs = require("fs")
const chalk = require("chalk");

// Abis
const routerAbi = require("./abis/routerAbi.json");

const addressesBSCPancakeswap = require("./addresses/addressesBSCPancakeswap");
const addressesMATICQuickswap = require("./addresses/addressesMATICQuickswap");
const addressesOKEXCherryswap = require("./addresses/addressesOKEXCherryswap");
const addressesBSCApeswap = require("./addresses/addressesBSCApeswap");

const blockchain = [addressesBSCPancakeswap, addressesBSCApeswap, addressesMATICQuickswap, addressesOKEXCherryswap];

//Number 0 = Binance Smart Chain (CAKE)
//Number 1 = Binance Smart Chain (BANANA)
//Number 2 = Polygon Chain (QUICK)
//Numer 2 = Okex Chain (CHERRY)

const addresses = blockchain[1];

//Wallet 
const mnemonic = fs.readFileSync("./mnemonic.txt", "utf-8");

const provider = new ethers.providers.JsonRpcProvider(addresses.rpc);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

//Contracts
const factory = new ethers.Contract(
  addresses.factory,
  ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
  account
);
const router = new ethers.Contract(
  addresses.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint256 deadline) external returns (uint[] memory amounts)'
  ],
  account
);

const tokenToBuy = addresses.usdt;

const init = async() => {
    const tokenIn = addresses.wrapped;
    const tokenOut = tokenToBuy;

    //WrappedCoin quantity
    const amountIn = ethers.utils.parseUnits('0.01', 'ether');
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    //Our execution price will be a bit different, we need some flexbility
    const amountOutMin = 0;
    
    console.log(chalk.yellow(`
      Buying new token
    =================
    tokenIn: ${tokenIn} (WrappedCoin)
    tokenOut: ${tokenOut} (New Token)
    `));
    const tx = await router.swapExactETHForTokens(
        amountOutMin,
        [tokenIn, tokenOut],
        addresses.recipient,
        Date.now() + 1000 * 60 * 10, //10 minutes
        {
        'gasLimit': 300000,
        'gasPrice': ethers.utils.parseUnits('20', 'gwei'),
        value: amountIn,
        }
    );
    const receipt = await tx.wait(); 
    console.log(chalk.blue('Transaction receipt'));
    const transactionHash = receipt.logs[0].transactionHash;
    
    console.log(chalk.green(`https://polygonscan.com/tx/${transactionHash}`));
}
 


console.log("apeswap", addresses.factory);
