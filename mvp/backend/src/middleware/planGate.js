export function planGate(requiredPlan = 'starter') {
  const order = { starter: 1, growth: 2, pro: 3 };

  return (req, res, next) => {
    // TODO: replace with authenticated user subscription lookup
    const currentPlan = req.headers['x-plan'] || 'starter';
    if ((order[currentPlan] || 0) < (order[requiredPlan] || 1)) {
      return res.status(402).json({ error: 'Upgrade required', requiredPlan });
    }
    next();
  };
}
