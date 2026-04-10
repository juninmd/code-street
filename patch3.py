import re

with open('src/components/UserProfile.jsx', 'r') as f:
    content = f.read()

# Add icons properly
content = content.replace("import { DollarSign, Shield, TrendingUp, Wallet, Star, Gift, Zap, Share2, Link as LinkIcon, Users } from 'lucide-react';", "import { DollarSign, Shield, TrendingUp, Wallet, Star, Gift, Zap, Share2, Link as LinkIcon, Users, Target, CheckCircle } from 'lucide-react';")

with open('src/components/UserProfile.jsx', 'w') as f:
    f.write(content)
