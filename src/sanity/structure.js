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
        .icon(() => 'dY",')
        .child(
          S.documentList()
            .title('Project Proposals')
            .filter('_type == "projectProposal"')
            .defaultOrdering([{ field: 'presentationTime', direction: 'desc' }])
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

