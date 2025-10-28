// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Clubs')
        .child(
          S.documentList()
            .title('Clubs')
            .filter('_type == "club"')
        ),
      S.divider(),
      S.listItem()
        .title('Project Proposals')
        .icon(() => '📝')
        .child(
          S.documentList()
            .title('Project Proposals')
            .filter('_type == "projectProposal"')
            .defaultOrdering([{ field: 'presentationTime', direction: 'desc' }])
        ),
      S.listItem()
        .title('Active Projects')
        .icon(() => '🚀')
        .child(
          S.documentList()
            .title('Active Projects')
            .filter('_type == "activeProject"')
            .defaultOrdering([{ field: 'featured', direction: 'desc' }, { field: 'title', direction: 'asc' }])
        ),
      S.listItem()
        .title('Project Applications')
        .icon(() => '📋')
        .child(
          S.list()
            .title('Application Management')
            .items([
              S.listItem()
                .title('Pending Applications')
                .icon(() => '⏳')
                .child(
                  S.documentList()
                    .title('Pending Applications')
                    .filter('_type == "projectApplication" && status == "pending"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Under Review')
                .icon(() => '👀')
                .child(
                  S.documentList()
                    .title('Applications Under Review')
                    .filter('_type == "projectApplication" && status == "reviewing"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Accepted Applications')
                .icon(() => '✅')
                .child(
                  S.documentList()
                    .title('Accepted Applications')
                    .filter('_type == "projectApplication" && status == "accepted"')
                    .defaultOrdering([{ field: 'reviewDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Applications')
                .icon(() => '📋')
                .child(
                  S.documentList()
                    .title('All Applications')
                    .filter('_type == "projectApplication"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Members')
        .child(S.documentList().title('Members').filter('_type == "member"')),
      S.listItem()
        .title('Events')
        .child(S.documentList().title('Events').filter('_type == "event"')),
      S.listItem()
        .title('Projects')
        .child(S.documentList().title('Projects').filter('_type == "project"')),
      S.listItem()
        .title('Galleries')
        .child(S.documentList().title('Galleries').filter('_type == "gallery"')),
    ])

