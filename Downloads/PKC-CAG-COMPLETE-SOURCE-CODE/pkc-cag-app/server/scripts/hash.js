const bcrypt = require("bcryptjs");

(async () => {
  const plain = "Smitha@1022";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);
  console.log("HASH:\n", hash);
})();
