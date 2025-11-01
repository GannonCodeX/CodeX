'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';
import styles from './MemberSelect.module.css';

const MemberSelect = ({ members }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState(members);
  const wrapperRef = useRef(null);

  // Handle clicks outside the component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelectMember = (member) => {
    setSelectedMembers([...selectedMembers, member]);
    setAvailableMembers(availableMembers.filter((m) => m._id !== member._id));
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m._id !== member._id));
    setAvailableMembers([...availableMembers, member].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const filteredMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.selectContainer} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.selectedMembers}>
          {selectedMembers.length > 0 ? (
            selectedMembers.map((member) => (
              <div key={member._id} className={styles.memberPill}>
                {member.avatar ? (
                  <Image
                    src={urlFor(member.avatar).width(24).height(24).url()}
                    alt={member.name}
                    width={24}
                    height={24}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.placeholderAvatar}>
                    {member.name?.charAt(0) || '?'}
                  </div>
                )}
                <span>{member.name}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from opening
                    handleRemoveMember(member);
                  }}
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <span className={styles.placeholder}>Select team members...</span>
          )}
        </div>
        <div className={styles.arrow}>&#9662;</div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <ul className={styles.memberList}>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <li key={member._id} onClick={() => handleSelectMember(member)}>
                  {member.avatar ? (
                    <Image
                      src={urlFor(member.avatar).width(32).height(32).url()}
                      alt={member.name}
                      width={32}
                      height={32}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.placeholderAvatar}>
                      {member.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span>{member.name}</span>
                </li>
              ))
            ) : (
              <li className={styles.noResults}>No members found.</li>
            )}
          </ul>
        </div>
      )}
      {/* Hidden input to store IDs for form submission */}
      <input
        type="hidden"
        name="teamMemberIds"
        value={selectedMembers.map((m) => m._id).join(',')}
      />
    </div>
  );
};

export default MemberSelect;
