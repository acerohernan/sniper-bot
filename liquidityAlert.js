const Web3 =  require("web3");
const ethers = require("ethers");
const fs = require("fs")
const chalk = require("chalk");

// Abis
const routerAbi = require("./abis/routerAbi.json");

const addressesBSCPancakeswap = require("./addresses/addressesBSCPancakeswap");
const addressesBSCApeswap = require("./addresses/addressesBSCApeswap");
const addressesMATICQuickswap = require("./addresses/addressesMATICQuickswap");
const addressesOKEXCherryswap = require("./addresses/addressesOKEXCherryswap");


const blockchain = [addressesBSCPancakeswap, addressesBSCApeswap, addressesMATICQuickswap, addressesOKEXCherryswap];

//Number 0 = Binance Smart Chain (CAKE)
//Number 1 = Binance Smart Chain (BANANA)
//Number 2 = Polygon Chain (QUICK)
//Numer 2 = Okex Chain (CHERRY)

const addresses = blockchain[0];

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




const init = async() => {

  factory.on('PairCreated', async (token0, token1, pairAddress) => {

    console.log(chalk.yellow(`

    ///////////////////////////////////////////////////////////////////////

      New pair detected
      =================
      token0: ${token0}
      token1: ${token1}
      pairAddress: ${pairAddress}
    `))

    let newToken;

    if(token0 == addresses.wrapped){
      newToken = token1;
    }else{
      newToken = token0;
    }

    console.log(chalk.green(`https://bscscan.com/address/${newToken}`))


})};


init();