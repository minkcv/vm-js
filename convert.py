### Convert binary programs to ascii strings of UTF-8

import os
if os.path.exists('plain.txt'):
    os.remove('plain.txt')

pong = open('mars.rom', 'rb')
out = open('plain.txt', 'w')

byte = pong.read(1) # Skip length prefix
byte = pong.read(1) # Skip length prefix

# swap order of bytes because of endianness
byte = pong.read(1)
byte2 = pong.read(1)
while byte != b'':
    out.write(byte2.hex())
    out.write(byte.hex())
    byte = pong.read(1)
    byte2 = pong.read(1)

pong.close()
out.close()