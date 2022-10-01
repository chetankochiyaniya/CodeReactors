import { Typography } from "@mui/material";
import { Web3Context } from '../providers/Web3Provider'
import { useContext } from 'react'

export default function NFTDate({ date, nft, end_date }) {

    const { account } = useContext(Web3Context)
    const isAva = !nft.sold && !nft.canceled

    let isAvailable
    if (nft.seller == nft.creator && nft.owner == 0x0000000000000000000000000000000000000000) {
        isAvailable = false;
    }
    else if (nft.owner == nft.creator) {
        isAvailable = false;
    } else if (nft.owner == account && account != nft.creator) {
        isAvailable = true;
    } else if (isAva) {
        isAvailable = true;
    }

    return (
        <>
            <Typography variant="body2" color="white">
                {isAvailable && `Bought on : ${date}`}
            </Typography><Typography variant="body2" color="white">
                {isAvailable && `Warranty expire's on : ${end_date}`}
            </Typography>
        </>
    );
}