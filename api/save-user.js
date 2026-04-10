let users = [];

export default function handler(req, res) {
  const { email } = req.body;

  users.push({ email, paid: true });

  res.json({ success: true });
}