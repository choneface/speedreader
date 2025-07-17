import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ py: 3, px: 2, mt: 4 }} component="footer">
      <Typography variant="body1" align="center">
        Check us out on{" "}
        <Link
          href="https://github.com/choneface/speedreader"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          github
        </Link>
        !
      </Typography>
    </Box>
  );
}
