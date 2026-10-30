GENEX - A DECENTRALIZED CONTENT AUTHENTICATION PLATFORM

# Problem Statement
The rapid development of Generative AI has transformed digital content creation, enabling the production of highly realistic videos, images, and text. However, this progress has also led to a significant rise in deepfakes, misinformation, and unauthoried content manipulation, posing serious threats to trust, security, and authenticity in digital ecosystems.

Existing solutions for content verification are largely centralized, lack transparency, and fail to provide to reliable machanism for tracking the origin and evolution of digital media.

# Proposed Solution   

Computing AI generated score of images to check the ambiguity of the content by checking the amount of AI used. These images will be authenticated so others can also verify that image. The system works on the strong combination of the provenance and AI scoring.

# Actual Strategy

 Goal: let a creator prove who registered a piece of content, and when, without the server ever keeping the file. Anyone can later check a file against that record.

1. Fingerprint in the browser. SHA-256 gives exact matching. A 64-bit perceptual hash (pHash) finds edited or re-encoded copies of images. Only the hashes are sent to the server.
2. Timestamp immediately. An RFC 3161 timestamp from a trusted timestamp authority proves the hash existed at that moment.
3. Screen with AI. The file is sent once to a deepfake detector, then deleted. The result is an advisory score, shown with a disclaimer.
4. Store a permanent record. A small metadata package is uploaded to IRYS.
5. Anchor in batches. Every hour, all pending hashes go into one Merkle tree. Only the root is written to Polygon Amoy, so one transaction covers up to 1,000 items. A user’s smart wallet pays no gas, via the Paymaster.
6. Verify without an account. Exact match goes by SHA-256 lookup and Merkle proof, similar match by pHash distance. The portal shows provenance and the AI score as two separate sections.            

# Teck stack

|            Layer	               |                 Technology                                                  |
------------------------------------------------------------------------------------------------------------------
             Frontend              |    React 18, TypeScript, Vite, React Router, Web Crypto API
             Backend               |    Python, FastAPI, SQLAlchemy 2, APScheduler, PyJWT
             Database              |    PostgreSQL (Neon or local)
             Web3 service          |    Node.js: Etherspot SDK (ERC-4337 wallets, Paymaster), Irys SDK
             

# Performance of Project 


# Setup Requirements