
## ping


IP rfc 791 : https://datatracker.ietf.org/doc/html/rfc791

socketTutorial from yt : https://github.com/rhymu8354/SocketTutorial

man 2 socket : https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/socket.2.html

man 3 getprotoent : https://www.man7.org/linux/man-pages/man3/getprotoent.3.html

`cat /etc/protocols | grep icmp`

socket.h mac : https://opensource.apple.com/source/xnu/xnu-6153.81.5/bsd/sys/socket.h.auto.html

https://www.cloudflare.com/en-gb/learning/ddos/glossary/internet-control-message-protocol-icmp/
https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol



sendTo : https://www.man7.org/linux/man-pages/man2/sendto.2.html


/Library/Developer/CommandLineTools/SDKs/MacOSX11.1.sdk/usr/include/sys/socket.h

```
/*
 * [XSI] Structure used by kernel to store most addresses.
 */
struct sockaddr {
	__uint8_t       sa_len;         /* total length */
	sa_family_t     sa_family;      /* [XSI] address family */
	char            sa_data[14];    /* [XSI] addr value (actually larger) */
};

/*
 * [XSI] sockaddr_storage
 */
struct sockaddr_storage {
	__uint8_t       ss_len;         /* address length */
	sa_family_t     ss_family;      /* [XSI] address family */
	char                    __ss_pad1[_SS_PAD1SIZE];
	__int64_t       __ss_align;     /* force structure storage alignment */
	char                    __ss_pad2[_SS_PAD2SIZE];
};

```

https://www.tutorialspoint.com/unix_sockets/socket_structures.htm


/Library/Developer/CommandLineTools/SDKs/MacOSX11.1.sdk/usr/include/netinet/in.h

```
/*
 * Socket address, internet style.
 */
struct sockaddr_in {
	__uint8_t       sin_len;
	sa_family_t     sin_family;
	in_port_t       sin_port;
	struct  in_addr sin_addr;
	char            sin_zero[8];
};
```


FQDN : https://www.networksolutions.com/blog/establish/domains/what-is-a-fully-qualified-domain-name--fqdn--

How to translate a domain to ip-address ?



--- 

ICMP : 

```
Echo or Echo Reply Message

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |     Type      |     Code      |          Checksum             |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |           Identifier          |        Sequence Number        |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |     Data ...
   +-+-+-+-+-

   IP Fields:

   Addresses

      The address of the source in an echo message will be the
      destination of the echo reply message.  To form an echo reply
      message, the source and destination addresses are simply reversed,
      the type code changed to 0, and the checksum recomputed.

   IP Fields:

   Type

      8 for echo message;

      0 for echo reply message.

   Code

      0

   Checksum

      The checksum is the 16-bit ones's complement of the one's
      complement sum of the ICMP message starting with the ICMP Type.
      For computing the checksum , the checksum field should be zero.
      If the total length is odd, the received data is padded with one
      octet of zeros for computing the checksum.  This checksum may be
      replaced in the future.

   Identifier

      If code = 0, an identifier to aid in matching echos and replies,
      may be zero.

   Sequence Number

      If code = 0, a sequence number to aid in matching echos and
      replies, may be zero.

   Description

      The data received in the echo message must be returned in the echo
      reply message.

      The identifier and sequence number may be used by the echo sender
      to aid in matching the replies with the echo requests.  For
      example, the identifier might be used like a port in TCP or UDP to
      identify a session, and the sequence number might be incremented
      on each echo request sent.  The echoer returns these same values
      in the echo reply.

      Code 0 may be received from a gateway or a host.

```

example `ping 128.128.128.128` :

with `sudo tcpdump -X icmp`

```
11:38:40.238926 IP 192.168.1.106 > 128.128.128.128: ICMP echo request, id 15912, seq 0, length 64
        0x0000:  0090 27fe eb80 a078 1770 569a 0800 4500  ..'....x.pV...E.
        0x0010:  0054 6fb4 0000 4001 47e2 c0a8 016a 8080  .To...@.G....j..
        0x0020:  8080 0800 ab32 3e28 0000 615c 1d20 0003  .....2>(..a\....
        0x0030:  a522 0809 0a0b 0c0d 0e0f 1011 1213 1415  ."..............
        0x0040:  1617 1819 1a1b 1c1d 1e1f 2021 2223 2425  ...........!"#$%
        0x0050:  2627 2829 2a2b 2c2d 2e2f 3031 3233 3435  &'()*+,-./012345
        0x0060:  3637   
```

`0800 ab32 3e28 0000` : 
	* type 8
	* code 0
	* checksum 0xab32
	* identifier 0x3e28 : maybe 0
	* sequence number 0x0000 : maybe 0
	* description : lot of data without documentation. Is it needed ? I don't think so

