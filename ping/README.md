
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


FQDN : https://www.networksolutions.com/blog/establish/domains/what-is-a-fully-qualified-domain-name--fqdn--

How to translate a domain to ip-address ?
