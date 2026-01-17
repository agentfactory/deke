# Campaign & Lead Discovery Specification

## Overview
A lead discovery system that finds and scores potential booking opportunities around existing trip locations through multi-source scraping.

## User Flows
- View list of all campaigns with lead counts and status
- Create a new campaign by specifying location and search radius
- View leads discovered by a campaign with scoring indicators
- Filter and sort leads by score, source, and venue type
- Review lead details including contact information and venue metadata

## UI Requirements
- List view showing campaigns with key metrics (location, date created, lead count, status)
- Each campaign card displays: campaign name, location, discovery sources, total leads, high-score leads, campaign status
- Lead list view with scoring indicators (1-100 scale, color-coded)
- Multi-source tags showing where each lead was discovered (ChoralNet, CASA, Facebook, Instagram, Google API)
- Lead detail cards showing venue information, contact details, and score breakdown
- Actions: Create campaign button, View leads, Filter by score/source
- Mobile-responsive design

## Configuration
- shell: true
