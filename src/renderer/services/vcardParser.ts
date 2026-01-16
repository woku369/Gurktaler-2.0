// vCard Parser for Google Contacts Import
// Supports vCard 3.0 and 4.0 formats

export interface ParsedContact {
  name: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/**
 * Parse vCard (.vcf) file content and extract contacts
 * Supports both single and multiple vCards in one file
 */
export function parseVCard(vcfContent: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  
  // Split by BEGIN:VCARD to handle multiple contacts
  const vCards = vcfContent.split(/BEGIN:VCARD/i).filter(Boolean);
  
  for (const vCardBlock of vCards) {
    const contact = parseVCardBlock(vCardBlock);
    if (contact && contact.name) {
      contacts.push(contact);
    }
  }
  
  return contacts;
}

/**
 * Parse a single vCard block
 */
function parseVCardBlock(block: string): ParsedContact | null {
  const lines = block.split(/\r?\n/).filter(Boolean);
  
  const contact: ParsedContact = {
    name: '',
  };
  
  for (const line of lines) {
    // Handle line folding (lines starting with space/tab are continuations)
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('END:VCARD')) continue;
    
    // Parse property:value format
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const propertyPart = trimmedLine.substring(0, colonIndex);
    const value = trimmedLine.substring(colonIndex + 1).trim();
    
    if (!value) continue;
    
    // Extract property name (before ; or :)
    const property = propertyPart.split(';')[0].toUpperCase();
    
    switch (property) {
      case 'FN': // Formatted Name (preferred for display, but we'll parse N for structure)
        // We'll use FN only as fallback if N is not available
        break;
        
      case 'N': // Structured Name (Family;Given;Additional;Prefix;Suffix)
        if (!contact.name) {
          // Format: Family;Given;Additional;Prefix;Suffix
          const nameParts = value.split(';');
          const familyName = nameParts[0] ? decodeVCardValue(nameParts[0].trim()) : '';
          const givenName = nameParts[1] ? decodeVCardValue(nameParts[1].trim()) : '';
          
          if (givenName && familyName) {
            contact.name = givenName;
            contact.last_name = familyName;
          } else if (givenName) {
            contact.name = givenName;
          } else if (familyName) {
            contact.name = familyName;
          }
        }
        break;
        
      case 'ORG': // Organization
        if (!contact.company) {
          contact.company = decodeVCardValue(value);
        }
        break;
        
      case 'EMAIL':
        if (!contact.email) {
          contact.email = decodeVCardValue(value);
        }
        break;
        
      case 'TEL': // Telephone
        if (!contact.phone) {
          // Clean phone number
          const cleanPhone = value.replace(/[^\d\s\+\-\(\)]/g, '');
          contact.phone = cleanPhone.trim();
        }
        break;
        
      case 'ADR': // Address
        if (!contact.address) {
          // Format: POBox;ExtAddress;Street;City;Region;PostalCode;Country
          const addrParts = value.split(';').filter(Boolean);
          contact.address = addrParts.join(', ');
        }
        break;
        
      case 'NOTE':
        if (!contact.notes) {
          contact.notes = decodeVCardValue(value);
        }
        break;
    }
  }
  
  return contact.name ? contact : null;
}

/**
 * Decode vCard special characters and encoding
 */
function decodeVCardValue(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Detect potential duplicates by comparing email or name
 */
export function findPotentialDuplicates(
  newContacts: ParsedContact[],
  existingContacts: Array<{ name: string; email?: string }>
): Map<ParsedContact, Array<{ name: string; email?: string }>> {
  const duplicates = new Map();
  
  for (const newContact of newContacts) {
    const matches = existingContacts.filter(existing => {
      // Exact email match
      if (newContact.email && existing.email &&
          newContact.email.toLowerCase() === existing.email.toLowerCase()) {
        return true;
      }
      
      // Similar name match (case-insensitive)
      if (newContact.name.toLowerCase() === existing.name.toLowerCase()) {
        return true;
      }
      
      return false;
    });
    
    if (matches.length > 0) {
      duplicates.set(newContact, matches);
    }
  }
  
  return duplicates;
}
