import re

with open('src/components/UserProfile.jsx', 'r') as f:
    content = f.read()

# Fix unmatched div issue
content = content.replace("""
                    </div>

                    </div>

                    {/* Weekly Challenges */}
""", """
                    </div>

                    {/* Weekly Challenges */}
""")

with open('src/components/UserProfile.jsx', 'w') as f:
    f.write(content)
