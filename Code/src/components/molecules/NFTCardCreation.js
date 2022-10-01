import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import { TextField, Card, CardActions, CardContent, CardMedia, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { Web3Context } from "../providers/Web3Provider";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
    display: "flex",
    background: '#222',
    color: 'white',
    boxShadow: '0px 0px 10px #fff',
    margin: "15px 15px",
    flexGrow: 1,
  },
  cardActions: {
    margin: "auto",
  },
  media: {
    height: 0,
    margin: 5,
    paddingTop: "56.25%", // 16:9
    cursor: "pointer",
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
  }
});


const defaultFileUrl = "https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg";

export default function NFTCardCreation({ addNFTToList }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(defaultFileUrl);
  const classes = useStyles();
  const { register, handleSubmit, reset } = useForm();
  const { account, nftContract } = useContext(Web3Context);
  const [isLoading, setIsLoading] = useState(false);

  async function createNft(metadataUrl) {
    const transaction = await nftContract.mintToken(metadataUrl);
    const tx = await transaction.wait();
    const event = tx.events[0];
    const tokenId = event.args[2];
    return tokenId;
  }

  function createNFTFormDataFile(name, warrantyYear, warrantySerial, warrantyDescription, description, file) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("warrantyYear", warrantyYear);
    formData.append("warrantySerial", warrantySerial);
    formData.append("warrantyDescription", warrantyDescription);
    formData.append("description", description);
    formData.append("file", file);
    return formData;
  }

  async function uploadFileToIPFS(formData) {
    const { data } = await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.url;
  }

  async function onFileChange(event) {
    if (!event.target.files[0]) return;
    setFile(event.target.files[0]);
    setFileUrl(URL.createObjectURL(event.target.files[0]));
  }

  async function onSubmit({ name, warrantyYear, warrantySerial, warrantyDescription, description }) {
    try {
      if (!file || isLoading) return;
      setIsLoading(true);
      const formData = createNFTFormDataFile(name, warrantyYear, warrantySerial, warrantyDescription, description, file);
      const metadataUrl = await uploadFileToIPFS(formData);
      const tokenId = await createNft(metadataUrl);
      addNFTToList(tokenId);
      setFileUrl(defaultFileUrl);
      reset();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {account === "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ? (
        <Card className={classes.root} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="file-input">
            <CardMedia className={classes.media} alt="Upload image" image={fileUrl} />
          </label>
          <input style={{ display: "none" }} type="file" name="file" id="file-input" onChange={onFileChange} />
          <CardContent sx={{ paddingBottom: 0 }}>
            <TextField
              className={classes.textInputField}
              id="name-input"
              label="Name"
              name="name"
              size="small"
              fullWidth
              required
              margin="dense"
              disabled={isLoading}
              {...register("name")}
            />
            <TextField
              className={classes.textInputField}
              id="warrantyYear-input"
              label="Warranty Year"
              name="warrantyYear"
              type="number"
              size="small"
              fullWidth
              required
              margin="dense"
              disabled={isLoading}
              {...register("warrantyYear")}
            />
            <TextField
              className={classes.textInputField}
              id="warrantySerial-input"
              label="Serial Number"
              name="warrantySerial"
              type="number"
              size="small"
              fullWidth
              required
              margin="dense"
              disabled={isLoading}
              {...register("warrantySerial")}
            />
            <TextField
              className={classes.textInputField}
              id="warrantyDescription-input"
              label="Warranty Description"
              name="warrantyDescription"
              size="small"
              multiline
              rows={2}
              fullWidth
              required
              margin="dense"
              disabled={isLoading}
              {...register("warrantyDescription")}
            />
            <TextField
              className={classes.textInputField}
              id="description-input"
              label="Description"
              name="description"
              size="small"
              multiline
              rows={2}
              fullWidth
              required
              margin="dense"
              disabled={isLoading}
              {...register("description")}
            />
          </CardContent>
          <CardActions className={classes.cardActions}>
            <Button size="small" type="submit" style={{ background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 5px' }}>
              {isLoading ? <CircularProgress size="20px" style={{ color: 'white' }} /> : "Create"}
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Card
          className={classes.root}
          component="form"
          sx={{ maxWidth: 345, opacity: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <img src='./lock_icon.png' alt="access denied" height={320} style={{ padding: '40px 0 20px 0' }} />
          <CardActions className={classes.cardActions}>
            <Button size="small" type="submit" style={{ background: 'linear-gradient(#036dbf, #0e9bed)', color: 'white', padding: '6px 15px', margin: '20px auto' }}>
              {isLoading ? <CircularProgress size="20px" style={{ color: 'white' }} /> : "Only Retailer can create NFT"}
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
}
