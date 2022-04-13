const serverUrl = 'https://1g4l31tznuzl.usemoralis.com:2053/server';//free server moralis
const appId = 'Mdlkyz9c4kDjLfBhW4Ox9ulSnrbB0gvvqI8IIdHH'; //app id moralis

// custom token:web3 info
const web3 = {
  address: "0x256f624aDb3aCA12Be4C00b8B42A7C22F926d3Bf",
  decimals: 9,
  logoURI: 'https://tokens.1inch.io/0x256f624aDb3aCA12Be4C00b8B42A7C22F926d3Bf.png',
  name: 'Web3-il',
  symbol: 'WEB',
};
//add web3 to metamask:info
const tokenAddress = '0x256f624aDb3aCA12Be4C00b8B42A7C22F926d3Bf';
const tokenSymbol = 'web3';
const tokenDecimals = 9;
const tokenImage = 'http://web3-il-swap.epizy.com/web3-il.jpg';

let currentUser;
let s = 1; // fee
let currentTrade = {};
let currentSelectSide;
let tokens;
let result;
let ht ;// hold web3


async function info() {
  logwallet();
  let d = 0;
  let coinf = null;
  let coint = null;
  const options = { chain: 'bsc', }
  const balances = await Moralis.Web3API.account.getTokenBalances(options);
  for (symbol in balances) {
    if(balances[symbol].symbol == "200"){
    ht = 1;
    }
  if(balances[symbol].token_address == currentTrade.from.address)
  {
    coinf = symbol;
  }
}

  if(coinf == null)
  {
    coinf = 0;
  }
  else{
    d = balances[coinf].decimals;
    coinf = balances[coinf].balance;
    coinf = Moralis.Units.FromWei(coinf, d);
  }
  document.getElementById('fb').innerHTML = coinf;
  coinf = null;

  for (symbol in balances) {
    if(balances[symbol].symbol == "200"){
    ht = 1;
  }

  if(balances[symbol].token_address == currentTrade.to.address)
  {
    coint = symbol;
  }


}

if(coint == null)
  {
    coint = 0;
  }
  else{
    d = balances[coint].decimals;
    coint = balances[coint].balance;
    coint = Moralis.Units.FromWei(coint, d);
  }

  document.getElementById('tb').innerHTML = coint;
  coint = null;
}



function logwallet(){
  let cookie = document.cookie; 
  cookie = cookie.split(" ");
  if(currentUser == null){
  document.getElementById('in').style.display='block';
  document.getElementById('login_button').style.display='block';
  document.getElementById('btn-logout').style.display='none';  
  document.getElementById("navbarDropdown").innerHTML = "Login"; 

}
  else{
    document.getElementById('in').style.display='none';
    document.getElementById('login_button').style.display='none';
    document.getElementById('btn-logout').style.display='block';
    document.getElementById("navbarDropdown").innerHTML = "Logout";
  }
  if(cookie[1] != "logo"){
    document.getElementById('add_logo').style.display='block';
  }
  else{
    document.getElementById('add_logo').style.display='none';
  }



}

async function init() {
  logwallet();
  await Moralis.start({ serverUrl, appId });
  logwallet();
  await Moralis.enableWeb3();
  logwallet();
  await listAvailableTokens();
  currentUser = Moralis.User.current();
  if (currentUser) {
    document.getElementById('swap_button').disabled = false;
  }
  logwallet();

}

async function listAvailableTokens() {
  result = await Moralis.Plugins.oneInch.getSupportedTokens({ chain: 'bsc' });
  tokens = result.tokens;
  tokens[0] = web3;
  const parent = document.getElementById('token_list');
  Object.keys(tokens).forEach((address) => {
    const token = tokens[address];
    const div = document.createElement('div');
    div.setAttribute('data-address', address);
    div.className = 'token_row';
    const html = `
        <img class="token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span>
        `;
    div.innerHTML = html;
    div.onclick = () => {
      selectToken(address);
    };
    parent.appendChild(div);
  });
}
  function selectToken(address) {
  closeModal();
  currentTrade[currentSelectSide] = tokens[address];
  renderInterface();
  info();
  slippageSWAP();
  getQuote();
}

function renderInterface() {
  info();
  if (currentTrade.from) {
    document.getElementById('from_token_img').src = currentTrade.from.logoURI;
    document.getElementById('from_token_text').innerHTML = currentTrade.from.symbol;

  }
  if (currentTrade.to) {
    document.getElementById('to_token_img').src = currentTrade.to.logoURI;
    document.getElementById('to_token_text').innerHTML = currentTrade.to.symbol;
  }
}

async function login() {
  logwallet();
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.authenticate();
    }
    document.getElementById('btn-logout').style.display='block'
    document.getElementById('swap_button').disabled = false;
  } catch (error) {
    console.log(error);
  }
  logwallet();
}



async function isframe(){
  let response = await Moralis.Plugins.fiat.buy({}, {disableTriggers: true});
  document.getElementById('firstif').style.display = 'block';
  document.getElementById('firstif').src = response.result.data;


}

async function logintwt() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.authenticate({ 
        provider: "walletconnect",  chainId: 56,
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ] 
    });
    }
    document.getElementById('swap_button').disabled = false;
  } catch (error) {
    console.log(error);
  }
}

function openModal(side) {
  currentSelectSide = side;
  document.getElementById('token_modal').style.display = 'block';
}
function closeModal() {
  document.getElementById('token_modal').style.display = 'none';
}

async function getQuote() {
  if (!currentTrade.from || !currentTrade.to || !document.getElementById('from_amount').value) return;

  const amount = Number(document.getElementById('from_amount').value * 10 ** currentTrade.from.decimals);

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount,
  });
  console.log(quote);
  document.getElementById('gas_estimate').innerHTML = quote.estimatedGas;
  document.getElementById('to_amount').value = quote.toTokenAmount / 10 ** quote.toToken.decimals;
}

async function trySwap() {
  const address = Moralis.User.current().get('ethAddress');
  const amount = Number(document.getElementById('from_amount').value * 10 ** currentTrade.from.decimals);


  if (currentTrade.from.symbol !== 'BSC') {
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: 'bsc',
      fromTokenAddress: currentTrade.from.address,
      fromAddress: address,
      amount,
    });
    console.log(allowance);
    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: 'bsc',
        tokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
      });
    }
  }
  try {
    const receipt = await doSwap(address, amount);
    alert('Swap Complete');
  } catch (error) {
    console.log(error);
  }
}

async function logOut() {
  await Moralis.User.logOut();
  currentUser = null;
  logwallet();
  console.log('logged out');
}



function slippageSWAP() {
  s = 1;
  if(ht == 1)
  {
    s = 0.5;
  }

  if (currentTrade.from.address == "0x256f624aDb3aCA12Be4C00b8B42A7C22F926d3Bf" || currentTrade.to.address == "0x256f624aDb3aCA12Be4C00b8B42A7C22F926d3Bf") {
    s = 6;
  }

  return s;
}

function doSwap(userAddress, amount) {
  console.log(s);
  return Moralis.Plugins.oneInch.swap({
    chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount,
    fromAddress: userAddress, // Your wallet address
    slippage: s,
  });
}

async function addTokenFunction() {
  document.cookie = "logo";
  logwallet();
  try {
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', 
        options: {
          address: tokenAddress, 
          symbol: tokenSymbol, 
          decimals: tokenDecimals, 
          image: tokenImage, 
        },
      },
    });
    if (wasAdded) {
      console.log('Thanks for your interest!');
    } else {
      console.log('HelloWorld Coin has not been added');
    }
  } catch (error) {
    console.log(error);
  }

}

init();




document.getElementById('modal_close').onclick = closeModal;
document.getElementById('from_token_select').onclick = () => {
  openModal('from');
};
document.getElementById('to_token_select').onclick = () => {
  openModal('to');
};
document.getElementById('login_button').onclick = login;
document.getElementById('in').onclick = logintwt;
document.getElementById('from_amount').onblur = getQuote;
document.getElementById('swap_button').onclick = trySwap;
document.getElementById('btn-logout').onclick = logOut;
document.getElementById('add_logo').onclick = addTokenFunction;
//document.getElementById('fait').onclick = buycrypto;
