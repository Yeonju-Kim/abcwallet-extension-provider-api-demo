export const KIP7_CONTRACT = {
  abi: [
    {
      constant: true,
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
}

export function getKIP7Contract(web3, contractAddress) {
  const tokenContract = new web3.eth.Contract(
    KIP7_CONTRACT.abi,
    contractAddress
  )
  return tokenContract
}

export function callTransfer(
  address,
  contractAddress,
  web3
) {
  return new Promise(async (resolve, reject) => {
    try {
      const contract = getKIP7Contract(web3, contractAddress)
      await contract.methods
        .transfer(address, '1')
        .send(
          { from: address },
          (err, data) => {
            if (err) {
              reject(err)
            }
            resolve(data)
          }
        )
    } catch (err) {
      reject(err)
    }
  })
}