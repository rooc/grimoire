# TODO

## NIP pointers

- [ ] review community kinds and add a pointer to their NIP

## REQ timeline

- [ ] show invalid events (make sure validation run only once)
- [ ] toggle validation

## autocomplete

- [ ] desyncs on mobile
- [ ] leftover characters some times
- [ ] match inside strngs for profiles
- [ ] cold start (fresh login) show no profiles on @, perhaps fetch contact profiles and populate cache after login?

## wallet 

- [ ] resync tx list on succesful payment, doesn't show immediately with coinos
- [ ] if description is lnurl metadata, parse description/identifier
- [ ] fix: reverse command building shows Wallet instead of wallet

## NIP-22

- [ ] Root and reply have different icon colors, unify

## reactions

 - [ ] on reaction, looks like:
   + [ ] the publish event is not recorded to log unless log is open (?)
   + [ ] the inbox relays from the OP are not fetched/used some times

## NIPs & Kinds

 - [ ] script for getting constants & schemas up to date looking at the nostr-protocol/nips repo

## Blossom

 - [ ] media fallback when not found, look at the user's blossom relays, check for existence with HEAD and find fallback URL

## music

 - [ ] check lyrics are shown
 - [ ] show album art on feed? perhaps just if media is enabled

## group chat list

- [ ] group.lastMessage.pubkey uses wrong pubkey sometimes (gorup creator?)
