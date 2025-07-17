import { Box, Typography, Stack } from "@mui/material";
import logo from "../assets/icon-512.png";

export default function Header() {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <img
          src={logo}
          alt="Crix Reader Logo"
          style={{ width: 56, height: 56 }}
        />
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} align="left">
            Crix Reader
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="left">
            The speedreader that never saves your data!
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
