// src/app/components/emails/OfficerMagicLinkEmail.js
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

export function OfficerMagicLinkEmail({ officerName, clubName, magicLink, expiresIn }) {
  return (
    <Html>
      <Head />
      <Preview>Your magic link for {clubName} Officer Dashboard</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Officer Dashboard Access</Heading>

          <Text style={text}>
            Hi {officerName || 'there'},
          </Text>

          <Text style={text}>
            You requested access to the <strong>{clubName}</strong> officer dashboard.
            Click the button below to sign in:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Access Dashboard
            </Button>
          </Section>

          <Text style={textSmall}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={link}>
            {magicLink}
          </Text>

          <Text style={textSmall}>
            This link expires in {expiresIn || '24 hours'}. If you didn&apos;t request this,
            you can safely ignore this email.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>
              Gannon CodeX - Building the future of student tech
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  border: '2px solid #1a1a1a',
}

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center',
  margin: '0 0 30px',
  fontFamily: 'monospace',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#1a1a1a',
  margin: '0 0 20px',
}

const textSmall = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666666',
  margin: '20px 0 10px',
}

const link = {
  fontSize: '12px',
  color: '#666666',
  wordBreak: 'break-all',
  margin: '0 0 20px',
}

const buttonContainer = {
  textAlign: 'center',
  margin: '30px 0',
}

const button = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '14px 28px',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: '2px solid #1a1a1a',
  fontFamily: 'monospace',
}

const footer = {
  borderTop: '2px solid #1a1a1a',
  marginTop: '30px',
  paddingTop: '20px',
}

const footerText = {
  fontSize: '12px',
  color: '#666666',
  textAlign: 'center',
  margin: '0',
}

export default OfficerMagicLinkEmail
