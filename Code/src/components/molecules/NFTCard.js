import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress, Link, Typography, Modal, IconButton } from '@mui/material'
import { NFTModalContext } from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import NFTDescription from '../atoms/NFTDescription'
import NFTPrice from '../atoms/NFTPrice'
import NFTWarrantyYear from '../atoms/NFTWarrantyYear'
import NFTName from '../atoms/NFTName'
import CardAddresses from './CardAddresses'
import PriceTextField from '../atoms/PriceTextField'
import NFTDate from './NFTDate'
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import emailjs from '@emailjs/browser';
import swal from "sweetalert2";

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px',
    background: '#222',
    color: 'white',
    boxShadow: '0px 0px 10px #fff',
    flexGrow: 1,
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  },
  cardContent: {
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  firstDivider: {
    borderColor: '#555',
    margin: 'auto 0 10px'
  },
  lastDivider: {
    borderColor: '#555',
    marginTop: '10px'
  },
  addressesAndPrice: {
    display: 'flex',
    flexDirection: 'row'
  },
  addessesContainer: {
    margin: 'auto',
    width: '60%'
  },
  priceContainer: {
    width: '40%',
    margin: 'auto'
  },
  cardActions: {
    marginTop: 'auto',
    padding: '0 16px 8px 16px'
  },
  textInputField: {
    '& .MuiInputBase-root': {
      color: '#f2f6ff',
    },
    '& label.Mui-focused': {
      color: '#f2f6ff',
    },
    '& label': {
      color: '#aaa',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '036dbf',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#999',
      },
      '&:hover fieldset': {
        borderColor: '#f2f6ff',
      },
      '&.Mui-focused fieldset': {
        boxShadow: '0px 0px 2px #f2f6ff',
        borderColor: '#f2f6ff',
      },
    },
  },
  timerBar: {
    backgroundColor: '#888',
    background: '#888'
  }
})

async function getAndSetListingFee(marketplaceContract, setListingFee) {
  if (!marketplaceContract) return
  const listingFee = await marketplaceContract.getListingFee()
  setListingFee(ethers.utils.formatUnits(listingFee, 'ether'))
}

export default function NFTCard({ nft, action, updateNFT }) {
  const [open, setOpen] = useState(false);
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const { nftContract, marketplaceContract, hasWeb3 } = useContext(Web3Context)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [listingFee, setListingFee] = useState('')
  const [priceError, setPriceError] = useState(false)
  const [newPrice, setPrice] = useState(0)
  const [currDate, setCurrDate] = useState()
  const [enddate, setEndDate] = useState()
  const [emailModel, setEmailModel] = useState(false)
  const [email, setEmail] = useState()
  const [display, setDisplay] = useState();
  const classes = useStyles()
  const { name, warrantyYear, warrantySerial, warrantyDescription, description, image } = nft

  const handleClose = () => {
    setOpen(false);
  };
  const handleBtn = () => {
    setOpen(true);
  };


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


  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    right: "50%",
    buttom: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#222",
    color: "white",
    border: "3px solid #000",
    boxShadow: '0px 0px 10px #fff',
    p: 4,
  };

  useEffect(() => {
    getAndSetListingFee(marketplaceContract, setListingFee)
    getCurrentDate(nft)
  }, [])

  const actions = {
    buy: {
      text: 'buy',
      method: buyNft
    },
    cancel: {
      text: 'cancel',
      method: cancelNft
    },
    approve: {
      text: 'Approve for selling',
      method: approveNft
    },
    sell: {
      text: listingFee ? `Sell (${listingFee} fee)` : 'Sell',
      method: sellNft
    },
    none: {
      text: 'Sold',
      method: () => { }
    }
  }

  async function buyNft(nft) {
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await marketplaceContract.createMarketSale(nftContract.address, nft.marketItemId, {
      value: price
    })
    await transaction.wait()
    updateNFT()
  }

  async function cancelNft(nft) {
    const transaction = await marketplaceContract.cancelMarketItem(nftContract.address, nft.marketItemId)
    await transaction.wait()
    updateNFT()
  }

  async function approveNft(nft) {
    const approveTx = await nftContract.approve(marketplaceContract.address, nft.tokenId)
    await approveTx.wait()
    updateNFT()
    return approveTx
  }

  const Toast = swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", swal.stopTimer);
      toast.addEventListener("mouseleave", swal.resumeTimer);
    },
  });

  function getCurrentDate(nft) {
    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    let myCurrentDate = new Date();
    let myFutureDate = new Date(myCurrentDate);
    myFutureDate.setDate(myFutureDate.getDate() + nft.warrantyYear * 365);

    let e_date = myFutureDate.getDate();
    let e_month = myFutureDate.getMonth() + 1;
    let e_year = myFutureDate.getFullYear();

    const start = `${date}/${month < 10 ? `0${month}` : `${month}`}/${year}`
    const end = `${e_date}/${e_month < 10 ? `0${e_month}` : `${e_month}`}/${e_year}`
    setEndDate(end);
    setCurrDate(start);
  }

  function sendEmail() {
    setEmailModel(false)
    emailjs.send("service_42wsruk", "template_ehhjq81", {
      subject: "NFT Warranty Receipt",
      name: JSON.stringify(name),
      sno: JSON.stringify(warrantySerial),
      warranty_desc: JSON.stringify(warrantyDescription),
      sdate: JSON.stringify(currDate),
      edate: JSON.stringify(enddate),
      email: JSON.stringify(email),
    }, "Htbe1xWlKlXzmcLjE").then(function (response) {
      Toast.fire({
        customClass: {
          timerProgressBar: 'timerBar'
        },
        color: 'white',
        background: '#222',
        icon: "success",
        title: " Receipt send Successfully",
      });
    }, function (error) {
      Toast.fire({
        customClass: {
          timerProgressBar: 'timerBar'
        },
        color: 'white',
        background: '#222',
        icon: "error",
        title: `FAILED...Try Again`,
      });
    });
  }


  async function sellNft(nft) {
    if (!newPrice) {
      setPriceError(true)
      return
    }
    setPriceError(false)
    const listingFee = await marketplaceContract.getListingFee()
    const priceInWei = ethers.utils.parseUnits(newPrice, 'ether')
    const transaction = await marketplaceContract.createMarketItem(nftContract.address, nft.tokenId, warrantyYear, warrantySerial, priceInWei, { value: listingFee.toString() })
    await transaction.wait()
    updateNFT()
    return transaction
  }

  function handleCardImageClick() {
    setModalNFT(nft)
    setIsModalOpen(true)
  }

  async function onClick(nft) {
    try {
      setIsLoading(true)
      await actions[action].method(nft)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <>
      <Card
        className={classes.root}
        raised={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardMedia
          className={classes.media}
          style={{ margin: 5 }}
          alt={name}
          image={image}
          component="a" onClick={handleCardImageClick}
        />
        <CardContent className={classes.cardContent} >
          <NFTName name={name} />
          <NFTDescription description={description} />
          <Divider className={classes.firstDivider} />
          <Box className={classes.addressesAndPrice}>
            <div className={classes.addessesContainer}>
              <CardAddresses nft={nft} />
              <NFTWarrantyYear warrantyYear={warrantyYear} />
              <Typography style={{ color: '#0e9bed', cursor: 'pointer' }} onClick={() => { handleBtn() }}>Warranty Details</Typography>
            </div>
            <div className={classes.priceContainer}>
              {action === 'sell'
                ? <PriceTextField listingFee={listingFee} error={priceError} disabled={isLoading} onChange={e => setPrice(e.target.value)} />
                : <NFTPrice nft={nft} />
              }
            </div>
          </Box>
          <Divider className={classes.lastDivider} />
        </CardContent>
        <CardActions className={classes.cardActions}>
          <Button size="small" style={{ background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 15px' }} onClick={() => !isLoading && onClick(nft)}>
            {isLoading
              ? <CircularProgress size="20px" style={{ color: 'white' }} />
              : hasWeb3 && actions[action].text
            }
          </Button>{isAvailable || action === 'none' || action === 'approve' ? null : <img src="./new_item_logo.png" alt="new nft" height={35} />}
        </CardActions>
      </Card>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Typography gutterBottom variant="h4" component="div" style={{ margin: 0 }}>{name}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon style={{ color: '#ccc' }} />
            </IconButton>
          </div>
          <Typography component="div">Serial Number : {warrantySerial}</Typography>
          <Divider style={{ borderColor: '#555', margin: '8px 0px' }} />
          <Typography>Warranty Description : </Typography>
          <Typography>{warrantyDescription}</Typography>
          <Divider style={{ borderColor: '#555', margin: '8px 0px' }} />
          <NFTDate date={currDate} nft={nft} end_date={enddate} />

          <Button
            style={{ marginRight: 15, marginTop: 20, background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 15px' }}
            onClick={handleClose}
            variant="contained"
            color="error"
          >
            Close
          </Button>{isAvailable &&
            <Button
              style={{ marginRight: 15, marginTop: 20, background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 15px' }}
              onClick={() => {
                setOpen(false)
                setEmailModel(true)
              }}
              variant="contained"
              color="error"
            >
              Send Receipt
            </Button>
          }
        </Box>
      </Modal>



      <Modal
        open={emailModel}
        onClose={() => setEmailModel(false)}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Typography gutterBottom variant="h5" component="div" style={{ margin: 0 }}>Send Receipt</Typography>
            <IconButton onClick={() => setEmailModel(false)}>
              <CloseIcon style={{ color: '#ccc' }} />
            </IconButton>
          </div>
          <TextField
            className={classes.textInputField}
            id="email-input"
            label="Email Id"
            color="info"
            type='email'
            size="small"
            required
            margin="dense"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Button
            style={{ marginRight: 15, marginTop: 10, marginLeft: 20, background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 15px' }}
            onClick={sendEmail}
            variant="contained"
            color="error"
          >
            Send
          </Button>
        </Box>
      </Modal>
    </>
  )
}
