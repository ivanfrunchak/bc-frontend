const {CURRENT_ENV, CURRENT_NET} = require('./env.json');
export const getScanUrl = () => {

    
    if (CURRENT_NET == 'ETH') {


        if (CURRENT_ENV == 'PRD') {
            return 'https://etherscan.io'
        } else {
            return 'https://ropsten.etherscan.io'
        }
        
    } else {
        return 'https://bscscan.com'
    }
}

