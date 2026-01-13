// src/sanity/structure.js
// Club-centric content structure

export const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // Site Settings (Singleton)
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings')
        ),

      S.divider(),

      // Clubs - Main navigation hub
      S.listItem()
        .title('Clubs')
        .child(
          S.documentTypeList('club')
            .title('All Clubs')
            .child((clubId) =>
              S.list()
                .title('Club Content')
                .items([
                  // Club document itself
                  S.listItem()
                    .title('Club Details')
                    .child(
                      S.document()
                        .schemaType('club')
                        .documentId(clubId)
                    ),

                  S.divider(),

                  // Events for this club
                  S.listItem()
                    .title('Events')
                    .child(
                      S.documentList()
                        .title('Events')
                        .filter('_type == "event" && leadClub._ref == $clubId')
                        .params({ clubId })
                        .defaultOrdering([{ field: 'date', direction: 'desc' }])
                    ),

                  // Members affiliated with this club
                  S.listItem()
                    .title('Members')
                    .child(
                      S.documentList()
                        .title('Members')
                        .filter('_type == "member" && $clubId in affiliations[].club._ref')
                        .params({ clubId })
                        .defaultOrdering([{ field: 'name', direction: 'asc' }])
                    ),

                  // Officers for this club
                  S.listItem()
                    .title('Officers')
                    .child(
                      S.documentList()
                        .title('Officers')
                        .filter('_type == "clubOfficer" && club._ref == $clubId')
                        .params({ clubId })
                    ),

                  // Announcements for this club
                  S.listItem()
                    .title('Announcements')
                    .child(
                      S.documentList()
                        .title('Announcements')
                        .filter('_type == "announcement" && club._ref == $clubId')
                        .params({ clubId })
                        .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                    ),

                  // Resources for this club
                  S.listItem()
                    .title('Resources')
                    .child(
                      S.documentList()
                        .title('Resources')
                        .filter('_type == "clubResource" && club._ref == $clubId')
                        .params({ clubId })
                        .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                    ),

                  // Galleries for this club
                  S.listItem()
                    .title('Galleries')
                    .child(
                      S.documentList()
                        .title('Galleries')
                        .filter('_type == "gallery" && club._ref == $clubId')
                        .params({ clubId })
                    ),

                  // Polls for this club
                  S.listItem()
                    .title('Polls')
                    .child(
                      S.documentList()
                        .title('Polls')
                        .filter('_type == "availabilityPoll" && club._ref == $clubId')
                        .params({ clubId })
                        .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                    ),

                  // Projects led by this club
                  S.listItem()
                    .title('Projects')
                    .child(
                      S.documentList()
                        .title('Projects')
                        .filter('_type == "project" && leadClub._ref == $clubId')
                        .params({ clubId })
                        .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                    ),
                ])
            )
        ),

      S.divider(),

      // Projects section
      S.listItem()
        .title('Projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              S.listItem()
                .title('Proposals')
                .child(
                  S.documentList()
                    .title('Proposals')
                    .filter('_type == "project" && status == "proposed"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Active')
                .child(
                  S.documentList()
                    .title('Active Projects')
                    .filter('_type == "project" && status in ["active-seeking", "active-progress"]')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Completed')
                .child(
                  S.documentList()
                    .title('Completed Projects')
                    .filter('_type == "project" && status == "completed"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Projects')
                .child(
                  S.documentList()
                    .title('All Projects')
                    .filter('_type == "project"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
            ])
        ),

      // Applications section
      S.listItem()
        .title('Applications')
        .child(
          S.list()
            .title('Applications')
            .items([
              S.listItem()
                .title('Pending')
                .child(
                  S.documentList()
                    .title('Pending Applications')
                    .filter('_type == "projectApplication" && status == "pending"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Under Review')
                .child(
                  S.documentList()
                    .title('Under Review')
                    .filter('_type == "projectApplication" && status == "reviewing"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Accepted')
                .child(
                  S.documentList()
                    .title('Accepted')
                    .filter('_type == "projectApplication" && status == "accepted"')
                    .defaultOrdering([{ field: 'reviewDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Applications')
                .child(
                  S.documentList()
                    .title('All Applications')
                    .filter('_type == "projectApplication"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // Scheduling (all polls)
      S.listItem()
        .title('Scheduling')
        .child(
          S.list()
            .title('Availability Polls')
            .items([
              S.listItem()
                .title('Public Polls')
                .child(
                  S.documentList()
                    .title('Public Polls')
                    .filter('_type == "availabilityPoll" && visibility == "public"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Unlisted Polls')
                .child(
                  S.documentList()
                    .title('Unlisted Polls')
                    .filter('_type == "availabilityPoll" && visibility == "unlisted"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Polls')
                .child(
                  S.documentList()
                    .title('All Polls')
                    .filter('_type == "availabilityPoll"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // Global content (not club-specific)
      S.listItem()
        .title('Global')
        .child(
          S.list()
            .title('Global Content')
            .items([
              S.listItem()
                .title('All Members')
                .child(
                  S.documentList()
                    .title('All Members')
                    .filter('_type == "member"')
                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                ),
              S.listItem()
                .title('All Officers')
                .child(
                  S.documentList()
                    .title('All Officers')
                    .filter('_type == "clubOfficer"')
                ),
              S.listItem()
                .title('All Events')
                .child(
                  S.documentList()
                    .title('All Events')
                    .filter('_type == "event"')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Announcements')
                .child(
                  S.documentList()
                    .title('All Announcements')
                    .filter('_type == "announcement"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Galleries')
                .child(
                  S.documentList()
                    .title('All Galleries')
                    .filter('_type == "gallery"')
                ),
              S.listItem()
                .title('Resource Categories')
                .child(
                  S.documentList()
                    .title('Resource Categories')
                    .filter('_type == "resourceCategory"')
                ),
              S.listItem()
                .title('All Resources')
                .child(
                  S.documentList()
                    .title('All Resources')
                    .filter('_type == "clubResource"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
            ])
        ),
    ])
