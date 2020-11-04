## Notes

- All assembled files contain a 2-byte or 16-bit checksum which is used to confirm that the currently defined instructions used by the virtual machine match the instructions defined at the time of assembly.
- Said checksum will not protect from re-arranging of the defined instructions, only deletion or insertion of instructions.
- Labels are supported.

## Todo

- Confirm labels work perfectly.